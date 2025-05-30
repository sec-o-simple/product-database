export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'Product Database',
  description: 'A simple product database.',
  navItems: [
    {
      label: 'Home',
      href: '/',
    },
  ],
  navMenuItems: [
    {
      label: 'Vendors',
      href: '/vendors',
    },
  ],
}
