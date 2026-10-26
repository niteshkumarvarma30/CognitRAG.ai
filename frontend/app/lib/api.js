/**
 * Resolves the backend API base URL dynamically.
 * Works seamlessly on localhost (dev/test) and AWS EC2 / production environments.
 */
export const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // On local development, point to local python uvicorn
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    // In production, fallback to current origin
    return window.location.origin;
  }
  return process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
};
