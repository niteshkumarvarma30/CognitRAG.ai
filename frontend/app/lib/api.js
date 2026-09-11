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
    const protocol = window.location.protocol;
    const port = window.location.port;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      // If accessed via production domain (standard port 80/443 or no port specified)
      if (!port || port === '80' || port === '443') {
        return `${protocol}//${host}`;
      }
      return `${protocol}//${host}:8000`;
    }
  }
  return 'http://localhost:8000';
};
