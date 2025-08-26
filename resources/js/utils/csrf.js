/**
 * Get CSRF token safely from meta tag or cookie
 * @returns {string} CSRF token or empty string if not found
 */
export function getCsrfToken() {
    // Try to get from meta tag first
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) {
        const token = csrfMeta.getAttribute('content') || '';
        console.log('CSRF token from meta tag:', token);
        return token;
    }
    
    // Fallback: try to get from cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    if (token) {
        const cookieToken = decodeURIComponent(token.split('=')[1]);
        console.log('CSRF token from cookie:', cookieToken);
        return cookieToken;
    }
    
    // If still not found, return empty string
    console.warn('CSRF token not found');
    return '';
}

/**
 * Get CSRF token for fetch headers
 * @returns {object} Headers object with CSRF token
 */
export function getCsrfHeaders() {
    const token = getCsrfToken();
    return token ? { 'X-CSRF-TOKEN': token } : {};
}
