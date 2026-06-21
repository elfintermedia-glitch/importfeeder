export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Dispatch an event so AuthContext can pick it up and log out
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
    
    let message = 'An error occurred';
    try {
      const errorData = await response.json();
      message = errorData.error || message;
    } catch (e) {
      // Ignored
    }
    throw new Error(message);
  }

  return response.json();
};
