import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import { DeleteProduct, useProductQuery } from '@/routes/Product'
import {
  ProductFamilyChains,
  useProductFamilyQuery,
} from '@/routes/ProductFamilies'
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
  const { data: family } = useProductFamilyQuery(product?.family_id || '')

  if (!product) {
    return null
  }

  const openEditModal = () => {
    navigateToModal(`/products/${productId}/edit`, `/products/${productId}`)
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
            <Attribute
              label={t('form.fields.name')}
              value={product.name}
              key="name"
            />,
            <Attribute
              key="description"
              label={t('form.fields.description')}
              value={product.description || '-/-'}
            />,
            <Attribute
              label={t('form.fields.type')}
              value={t(`product.type.${product.type}`) || '-/-'}
              key="type"
            />,
            <Attribute
              key="idHelpers"
              label={t('form.fields.vendor')}
              value={vendor?.name || '-/-'}
              href={`/vendors/${product.vendor_id}`}
            />,
            family && (
              <Attribute
                key="productFamily"
                label={t('form.fields.productFamily')}
                value={<ProductFamilyChains item={family} />}
              />
            ),
          ]}
          actions={
            <div className="flex flex-row gap-2">
              <DeleteProduct product={product} />

              <Button
                variant="solid"
                color="primary"
                fullWidth
                onPress={() => openEditModal()}
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
