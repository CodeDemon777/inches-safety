import media1 from '../assets/uploads/media__1781863237198.jpg';
import media2 from '../assets/uploads/media__1781863237234.jpg';
import productPlus from '../assets/product-plus.jpg';
import productRegular from '../assets/product-regular.jpg';
import productXl from '../assets/product-xl.jpg';

const staticImageMap: Record<string, string> = {
  'media__1781863237198.jpg': media1,
  'media__1781863237234.jpg': media2,
  'product-plus.jpg': productPlus,
  'product-regular.jpg': productRegular,
  'product-xl.jpg': productXl,
};

export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;
 
export const resolveImageUrl = (url: string): string => {
  if (!url) return '';
  // Normalize backslashes to forward slashes
  const cleanUrl = url.replace(/\\/g, '/');
  
  const filename = cleanUrl.split('/').pop() || '';
  if (staticImageMap[filename]) {
    return staticImageMap[filename];
  }
  
  if (cleanUrl.includes('uploads/')) {
    const relativePath = cleanUrl.slice(cleanUrl.indexOf('uploads/'));
    const baseUrl = BACKEND_URL.replace(/\/api\/?$/, '');
    return `${baseUrl}/${relativePath}`;
  }
  return cleanUrl;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as any),
  };

  if (options.body instanceof FormData) {
    // Let browser set the correct content type with boundary
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
