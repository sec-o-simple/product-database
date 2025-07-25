import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import { EmptyState } from '@/components/table/EmptyState'
import { useProductQuery } from '@/routes/Product'
import { DeleteVersion, useVersionQuery } from '@/routes/Version'
import useRouter from '@/utils/useRouter'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Outlet, useParams } from 'react-router-dom'
import { AddRelationshipButton } from '../product/CreateRelationship'
import { TopBar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function VersionLayout() {
  const { navigateToModal, navigate } = useRouter()
  const { versionId } = useParams()
  const { t } = useTranslation()

  const { data: version, isLoading: isVersionLoading } = useVersionQuery(
    versionId || '',
  )
  const { data: product, isLoading: isProductLoading } = useProductQuery(
    version?.product_id,
  )

  useEffect(() => {
    if (isVersionLoading || isProductLoading) return
    if (!version || !product) {
      navigate(`/`, {
        state: {
          shouldRefetch: true,
          message: 'Version not found.',
          type: 'error',
        },
      })
    }
  }, [isVersionLoading, isProductLoading, product, version, navigate])

  if (!version || !product) {
    return <EmptyState />
  }

  return (
    <PageContainer>
      <TopBar
        historyLink={`/product-versions/${versionId}/history`}
        backLink={`/products/${version.product_id}`}
        title={
          <div className="flex flex-row items-center gap-2">
            <p>
              {t('product.label')}: {product?.name}
            </p>

            <Chip variant="flat" className="ml-2 rounded-md">
              {t('version.label')}: {version.name}
            </Chip>
          </div>
        }
      >
        <AddRelationshipButton
          versionId={version.id}
          returnTo={`/product-versions/${version.id}`}
        />
      </TopBar>

      <div className="flex h-full grow flex-row">
        <Sidebar
          attributes={[
            <Attribute
              label={t('version.label')}
              value={version.name}
              key="name"
            />,
            <Attribute
              label={t('form.fields.description')}
              value={version.description || '-/-'}
              key="description"
            />,
            <Attribute
              label={t('product.label')}
              value={product?.name || '-/-'}
              href={`/products/${version.product_id}`}
              key="product"
            />,
            <Button
              variant="light"
              color="primary"
              className="w-full justify-between px-2 text-base font-semibold"
              onPress={() =>
                navigate(
                  `/product-versions/${version.id}/identification-helpers`,
                )
              }
              key="identificationHelpers"
            >
              Identification Helpers
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </Button>,
          ]}
          actions={
            <div className="flex flex-row gap-2">
              <DeleteVersion version={version} />

              <Button
                variant="solid"
                color="primary"
                fullWidth
                onPress={() =>
                  navigateToModal(
                    `/product-versions/${versionId}/edit`,
                    `/product-versions/${version.id}`,
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
