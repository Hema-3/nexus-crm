export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('nexus_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Cleanly join the base URL and the path
    const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = url.startsWith('http') ? url : `${cleanBaseUrl}${cleanPath}`;

    const response = await fetch(fullUrl, { ...options, headers });
    
    if (response.status === 401 || response.status === 403) {
        // Handle unauthorized (e.g. token expired or invalid)
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
        window.location.href = '/login';
    }
    
    return response;
};
