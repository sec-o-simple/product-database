import { Divider } from '@heroui/react'
import { Tab, Tabs } from '@heroui/tabs'
import { useTranslation } from 'react-i18next'

export function DashboardTabs({
  selectedKey,
  endContent,
}: {
  selectedKey: 'vendors' | 'products' | 'productFamilies' | 'tree'
  endContent?: React.ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col items-center justify-between">
      <div className="mb-2 flex w-full items-center justify-between">
        <Tabs
          selectedKey={selectedKey}
          className="w-full"
          color="primary"
          variant="light"
        >
          <Tab
            key="vendors"
            title={t('vendor.label', { count: 2 })}
            href="/vendors"
          />
          <Tab
            key="products"
            title={t('product.label', { count: 2 })}
            href="/products"
          />
          <Tab
            key="productFamilies"
            title={t('productFamily.label', { count: 2 })}
            href="/product-families"
          />
          <Tab key="tree" title={t('treeView.label')} href="/tree" />
        </Tabs>

        {endContent}
      </div>

      <Divider />
    </div>
  )
}
