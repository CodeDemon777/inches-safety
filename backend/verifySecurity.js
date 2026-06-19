import mongoose from 'mongoose';
import http from 'http';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Order from './models/Order.js';
import Feedback from './models/Feedback.js';

const request = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = http.request(options, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = JSON.parse(d || '{}');
        } catch(e) {
          parsed = { raw: d };
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(data);
    req.end();
  });
};

const run = async () => {
  console.log('--- STARTING SECURITY VERIFICATION TESTS ---');
  
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ecocycle');
    console.log('[TEST] Connected to MongoDB');

    // Create test accounts
    const userA = new User({ email: 'userA@test.com', password: 'password', full_name: 'User A', role: 'user' });
    const userB = new User({ email: 'userB@test.com', password: 'password', full_name: 'User B', role: 'user' });
    const adminUser = new User({ email: 'adminTest@test.com', password: 'password', full_name: 'Admin Test', role: 'admin' });

    await User.deleteMany({ email: { $in: ['userA@test.com', 'userB@test.com', 'adminTest@test.com'] } });
    await userA.save();
    await userB.save();
    await adminUser.save();

    const secret = process.env.JWT_SECRET || 'supersecret123';
    const userAToken = jwt.sign({ id: userA._id, role: userA.role }, secret);
    const userBToken = jwt.sign({ id: userB._id, role: userB.role }, secret);
    const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, secret);

    // Create test order belonging to user B
    const testOrder = new Order({
      user_id: userB._id,
      email: userB.email,
      full_name: userB.full_name,
      address_line1: '123 St',
      city: 'City',
      state: 'State',
      pincode: '123456',
      total: 599,
      items: [{ product_id: '69d300000000000000000001', product_name: 'Eco Pad', price: 599, quantity: 1 }],
      payment_status: 'completed',
      status: 'placed'
    });
    await testOrder.save();

    // Create test feedback
    const testFeedback = new Feedback({
      user_id: userB._id,
      order_id: testOrder._id,
      rating: 5,
      comment: 'Excellent pad!',
      approved: false
    });
    await testFeedback.save();

    let passed = true;

    const assertStatus = (name, res, expectedStatus) => {
      if (res.status === expectedStatus) {
        console.log(`[PASS] ${name} -> Got status ${res.status} as expected.`);
      } else {
        console.error(`[FAIL] ${name} -> Expected status ${expectedStatus}, but got ${res.status}. Data:`, res.data);
        passed = false;
      }
    };

    // Test 1: Invoice unauthenticated download
    const res1 = await request('GET', `/api/invoice/${testOrder._id}`);
    assertStatus('Invoice: Unauthenticated guest download', res1, 401);

    // Test 2: Invoice download by different regular user (IDOR check)
    const res2 = await request('GET', `/api/invoice/${testOrder._id}?token=${userAToken}`);
    assertStatus('Invoice: Unauthorized user A downloading user B\'s invoice', res2, 403);

    // Test 3: Invoice download by the owner (User B)
    const res3 = await request('GET', `/api/invoice/${testOrder._id}?token=${userBToken}`);
    assertStatus('Invoice: Owner user B downloading own invoice', res3, 200);

    // Test 4: Invoice download by Admin
    const res4 = await request('GET', `/api/invoice/${testOrder._id}?token=${adminToken}`);
    assertStatus('Invoice: Admin downloading invoice', res4, 200);

    // Test 5: File upload by unauthenticated user
    const res5 = await request('POST', `/api/upload`);
    assertStatus('Upload: Unauthenticated single upload', res5, 401);

    // Test 6: File upload by regular user
    const res6 = await request('POST', `/api/upload`, { 'Authorization': `Bearer ${userAToken}` });
    assertStatus('Upload: Regular user single upload', res6, 403);

    // Test 7: Feedback submit by guest
    const res7 = await request('POST', `/api/feedback`, {}, { order_id: testOrder._id, rating: 5, comment: 'Nice!' });
    assertStatus('Feedback: Guest submit', res7, 401);

    // Test 8: Feedback submit by user A for user B's order
    const res8 = await request('POST', `/api/feedback`, { 'Authorization': `Bearer ${userAToken}` }, { order_id: testOrder._id, rating: 5, comment: 'Nice!' });
    assertStatus('Feedback: User A submitting for User B\'s order', res8, 403);

    // Test 9: Feedback submit by user B for own order
    const res9 = await request('POST', `/api/feedback`, { 'Authorization': `Bearer ${userBToken}` }, { order_id: testOrder._id, rating: 5, comment: 'Nice!' });
    assertStatus('Feedback: User B submitting for own order', res9, 201);

    // Test 10: Feedback approve toggle by regular user
    const res10 = await request('PUT', `/api/feedback/${testFeedback._id}/approve`, { 'Authorization': `Bearer ${userAToken}` });
    assertStatus('Feedback: Regular user toggling approval', res10, 403);

    // Test 11: Feedback approve toggle by admin
    const res11 = await request('PUT', `/api/feedback/${testFeedback._id}/approve`, { 'Authorization': `Bearer ${adminToken}` });
    assertStatus('Feedback: Admin toggling approval', res11, 200);

    // Test 12: Feedback admin seed by guest
    const res12 = await request('POST', `/api/feedback/admin`, {}, { guest_name: 'Fake Guest', rating: 5, comment: 'Spam' });
    assertStatus('Feedback: Admin endpoint access by guest', res12, 401);

    // Test 13: Feedback admin seed by regular user
    const res13 = await request('POST', `/api/feedback/admin`, { 'Authorization': `Bearer ${userAToken}` }, { guest_name: 'Fake Guest', rating: 5, comment: 'Spam' });
    assertStatus('Feedback: Admin endpoint access by regular user', res13, 403);

    // Test 14: Feedback admin seed by admin
    const res14 = await request('POST', `/api/feedback/admin`, { 'Authorization': `Bearer ${adminToken}` }, { guest_name: 'Admin Guest', rating: 5, comment: 'Valid Seed' });
    assertStatus('Feedback: Admin endpoint access by admin', res14, 201);

    // Clean up database
    await User.deleteMany({ email: { $in: ['userA@test.com', 'userB@test.com', 'adminTest@test.com'] } });
    await Order.findByIdAndDelete(testOrder._id);
    await Feedback.deleteMany({ order_id: testOrder._id });

    if (passed) {
      console.log('--- ALL SECURITY TESTS PASSED ---');
      process.exit(0);
    } else {
      console.error('--- SOME SECURITY TESTS FAILED ---');
      process.exit(1);
    }

  } catch(e) {
    console.error('Test Execution Error:', e);
    process.exit(1);
  }
};

run();
