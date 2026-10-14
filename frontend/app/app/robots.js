export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/api/']
    },
    sitemap: 'https://cognitrag.ai/sitemap.xml',
  }
}
