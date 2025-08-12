import { describe, it, expect } from 'vitest'
import { siteConfig, SiteConfig } from '../src/config/site'

describe('site config', () => {
  it('should have correct structure', () => {
    expect(siteConfig).toHaveProperty('name')
    expect(siteConfig).toHaveProperty('description')
    expect(siteConfig).toHaveProperty('navItems')
    expect(siteConfig).toHaveProperty('navMenuItems')
  })

  it('should have correct name and description', () => {
    expect(siteConfig.name).toBe('Product Database')
    expect(siteConfig.description).toBe('A simple product database.')
  })

  it('should have navItems as array', () => {
    expect(Array.isArray(siteConfig.navItems)).toBe(true)
    expect(siteConfig.navItems.length).toBeGreaterThan(0)
  })

  it('should have navMenuItems as array', () => {
    expect(Array.isArray(siteConfig.navMenuItems)).toBe(true)
    expect(siteConfig.navMenuItems.length).toBeGreaterThan(0)
  })

  it('should have correct nav item structure', () => {
    const firstNavItem = siteConfig.navItems[0]
    expect(firstNavItem).toHaveProperty('label')
    expect(firstNavItem).toHaveProperty('href')
    expect(firstNavItem.label).toBe('Home')
    expect(firstNavItem.href).toBe('/')
  })

  it('should have correct nav menu item structure', () => {
    const firstNavMenuItem = siteConfig.navMenuItems[0]
    expect(firstNavMenuItem).toHaveProperty('label')
    expect(firstNavMenuItem).toHaveProperty('href')
    expect(firstNavMenuItem.label).toBe('Vendors')
    expect(firstNavMenuItem.href).toBe('/vendors')
  })

  it('should have SiteConfig type defined', () => {
    const typedConfig: SiteConfig = siteConfig
    expect(typedConfig).toBeDefined()
  })
})
