import client from '@/client'
import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import { EmptyState } from '@/components/table/EmptyState'
import { useProductQuery } from '@/routes/Product'
import { DeleteVersion, useVersionQuery } from '@/routes/Version'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Outlet, useParams, useLocation } from 'react-router-dom'
import { AddRelationshipButton } from '../product/CreateRelationship'
import { TopBar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function VersionLayout() {
  const { navigateToModal, navigate } = useRouter()
  const { versionId } = useParams()
  const location = useLocation()
  const { t } = useTranslation()

  const { data: version, isPending: isVersionLoading } = useVersionQuery(
    versionId || '',
  )
  const { data: product, isPending: isProductLoading } = useProductQuery(
    version?.product_id,
  )

  const relationshipRequest = client.useQuery(
    'get',
    `/api/v1/product-versions/{id}/relationships`,
    {
      params: {
        path: {
          id: versionId || '',
        },
      },
    },
    {
      enabled: !!versionId,
    },
  )
  useRefetchQuery(relationshipRequest)
  const relationships = relationshipRequest.data

  const relationshipCount =
    relationships?.reduce((total, relationshipGroup) => {
      return (
        total +
        relationshipGroup.products.reduce((groupTotal, product) => {
          return groupTotal + (product.version_relationships?.length || 0)
        }, 0)
      )
    }, 0) || 0

  const identificationHelpersRequest = client.useQuery(
    'get',
    '/api/v1/product-versions/{id}/identification-helpers',
    {
      params: { path: { id: versionId || '' } },
    },
    {
      enabled: !!versionId,
    },
  )
  useRefetchQuery(identificationHelpersRequest)
  const identificationHelpersCount =
    identificationHelpersRequest.data?.length || 0

  const isRelationshipsActive =
    location.pathname === `/product-versions/${versionId}` ||
    location.pathname.startsWith(`/product-versions/${versionId}/relationships`)
  const isIdentificationHelpersActive = location.pathname.includes(
    '/identification-helpers',
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
        {isRelationshipsActive && (
          <AddRelationshipButton
            versionId={version.id}
            returnTo={`/product-versions/${version.id}`}
          />
        )}
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
              variant={isRelationshipsActive ? 'solid' : 'light'}
              color="primary"
              className={`w-full justify-between px-3 py-2 text-sm font-medium transition-all ${
                isRelationshipsActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-default-100'
              }`}
              onPress={() => navigate(`/product-versions/${version.id}`)}
              key="relationships"
            >
              <span>
                {t('relationship.label', { count: relationshipCount })}
              </span>
              {relationshipCount > 0 && (
                <Chip
                  size="sm"
                  variant={isRelationshipsActive ? 'solid' : 'flat'}
                  color={isRelationshipsActive ? 'default' : 'primary'}
                  className={
                    isRelationshipsActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : ''
                  }
                >
                  {relationshipCount}
                </Chip>
              )}
            </Button>,
            <Button
              variant={isIdentificationHelpersActive ? 'solid' : 'light'}
              color="primary"
              className={`w-full justify-between px-3 py-2 text-sm font-medium transition-all ${
                isIdentificationHelpersActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-default-100'
              }`}
              onPress={() =>
                navigate(
                  `/product-versions/${version.id}/identification-helpers`,
                )
              }
              key="identificationHelpers"
            >
              <span>
                {t('identificationHelper.label', {
                  count: identificationHelpersCount,
                })}
              </span>
              {identificationHelpersCount > 0 && (
                <Chip
                  size="sm"
                  variant={isIdentificationHelpersActive ? 'solid' : 'flat'}
                  color={isIdentificationHelpersActive ? 'default' : 'primary'}
                  className={
                    isIdentificationHelpersActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : ''
                  }
                >
                  {identificationHelpersCount}
                </Chip>
              )}
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
