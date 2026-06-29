export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;
 
export const resolveImageUrl = (url: string): string => {
  if (!url) return '';
  // Normalize backslashes to forward slashes
  const cleanUrl = url.replace(/\\/g, '/');
  
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
