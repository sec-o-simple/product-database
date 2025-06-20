import client from '@/client'
import ConfirmButton from '@/components/forms/ConfirmButton'
import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import {
  faArrowUpRightFromSquare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddRelationshipButton } from '../product/CreateRelationship'
import { TopBar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'

export default function VersionLayout() {
  const navigate = useNavigate()
  const { versionId, productId } = useParams()
  const location = useLocation()

  const { data: product } = client.useQuery('get', `/api/v1/products/{id}`, {
    params: {
      path: {
        id: productId || '',
      },
    },
  })

  const { data: version } = client.useQuery(
    'get',
    `/api/v1/product-versions/{id}`,
    {
      params: {
        path: {
          id: versionId || '',
        },
      },
    },
  )

  if (!version) {
    return null
  }

  const relationships = []

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
              <ConfirmButton
                color="danger"
                startContent={<FontAwesomeIcon icon={faTrash} />}
                confirmText="Are you sure you want to delete this version?"
                confirmTitle="Delete Version"
                onConfirm={() => {}}
              >
                Delete
              </ConfirmButton>

              <Button
                variant="solid"
                color="primary"
                fullWidth
                onPress={() =>
                  navigate(
                    `/products/${productId}/versions/${versionId}/edit`,
                    {
                      state: { backgroundLocation: location },
                    },
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
