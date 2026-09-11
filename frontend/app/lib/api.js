/**
 * Resolves the backend API base URL dynamically.
 * Works seamlessly on localhost (dev/test) and AWS EC2 / production environments.
 */
export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // On local development, point to local python uvicorn
    if (host === 'localhost' || host === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }
    // In production (cognitrag.com, www.cognitrag.com, or EC2):
    // Use the current origin (https://cognitrag.com) so all /api requests are secure and reverse-proxied by Nginx
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
};
