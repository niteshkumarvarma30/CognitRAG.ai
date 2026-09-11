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
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `${protocol}//${host}:8000`;
    }
  }
  return 'http://localhost:8000';
};
