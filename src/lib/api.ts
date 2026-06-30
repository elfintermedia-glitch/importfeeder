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
    
    let message = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        message = errorData.error || message;
      } else {
        const textData = await response.text();
        if (textData) {
           // We might not want to show full HTML, but if it's short, show it
           message = `${message} - ${textData.substring(0, 100)}`;
        }
      }
    } catch (e) {
      // Ignored
    }
    throw new Error(message);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    const textData = await response.text();
    try {
      return JSON.parse(textData);
    } catch (err) {
      throw new Error(`Unexpected response from server: ${textData.substring(0, 50)}...`);
    }
  }
};
