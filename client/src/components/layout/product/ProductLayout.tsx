import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import { DeleteProduct, useProductQuery } from '@/routes/Product'
import { useVendorQuery } from '@/routes/Vendor'
import useRouter from '@/utils/useRouter'
import { Button } from '@heroui/button'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { TopBar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'
import { AddVersionButton } from '../version/CreateEditVersion'

export default function ProductLayout() {
  const {
    params: { productId },
    navigateToModal,
  } = useRouter()
  const { t } = useTranslation()
  const { data: product } = useProductQuery(productId || '')
  const { data: vendor } = useVendorQuery(product?.vendor_id || '')

  if (!product) {
    return null
  }

  return (
    <PageContainer>
      <TopBar
        title={`${t('product.label')}: ${product.name}`}
        backLink={`/vendors/${product.vendor_id}`}
        historyLink={`/products/${product.id}/history`}
      >
        <div className="flex flex-row gap-4">
          <AddVersionButton
            productId={product.id}
            returnTo={`/products/${productId}`}
          />
        </div>
      </TopBar>

      <div className="flex grow flex-row overflow-scroll">
        <Sidebar
          attributes={[
            <Attribute label="Name" value={product.name} key="name" />,
            <Attribute
              key="description"
              label="Description"
              value={product.description || '-/-'}
            />,
            <Attribute label="Type" value={product.type || '-/-'} key="type" />,
            <Attribute
              key="idHelpers"
              label="Vendor"
              value={vendor?.name || '-/-'}
              href={`/vendors/${product.vendor_id}`}
            />,
          ]}
          actions={
            <div className="flex flex-row gap-2">
              <DeleteProduct product={product} />

              <Button
                variant="solid"
                color="primary"
                fullWidth
                onPress={() =>
                  navigateToModal(
                    `/products/${productId}/edit`,
                    `/products/${productId}`,
                  )
                }
              >
                {t('common.edit')}
              </Button>
            </div>
          }
        />
        <PageOutlet>
          <Outlet />
        </PageOutlet>
      </div>
    </PageContainer>
  )
}
