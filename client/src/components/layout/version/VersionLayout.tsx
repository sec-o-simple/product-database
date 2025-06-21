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

export default function VersionLayout() {
  const { navigateToModal, navigate } = useRouter()
  const { versionId, productId } = useParams()

  const { data: product } = useProductQuery(productId || '')
  const { data: version } = useVersionQuery(versionId || '')

  if (!version || !product) {
    navigate(`/products/${productId}`, {
      state: {
        shouldRefetch: true,
        message: 'Version or Product not found.',
        type: 'error',
      },
    })

    return <EmptyState />
  }

  return (
    <PageContainer>
      <TopBar
        historyLink={`/products/${productId}/versions/${versionId}/history`}
        title={
          <div className="flex flex-row gap-2 items-center">
            <p>Product: {product?.name}</p>

            <Chip variant="flat" className="rounded-md ml-2">
              Version: {version.name}
            </Chip>
          </div>
        }
      >
        <AddRelationshipButton />
      </TopBar>

      <div className="flex flex-row flex-grow h-full">
        <Sidebar
          attributes={[
            <Attribute label="Version" value={version.name} />,
            <Attribute
              label="Description"
              value={version.description || '-/-'}
            />,
            <Attribute
              label="Product"
              value={product?.name || '-/-'}
              href={`/products/${productId}`}
            />,
            <Button
              variant="light"
              color="primary"
              className="font-semibold text-md px-2 w-full justify-between"
              onPress={() =>
                navigate(
                  `/products/${productId}/versions/${versionId}/identification-helper`,
                )
              }
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
                    `/products/${productId}/versions/${versionId}/edit`,
                    `/products/${productId}/versions/${versionId}`,
                  )
                }
              >
                Edit Version
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
