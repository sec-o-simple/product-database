import client from '@/client'
import PageContainer from '@/components/forms/PageContainer'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import AddRelationship from '../product/AddRelationship'
import { TopBar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'

export default function VersionLayout() {
  const navigate = useNavigate()
  const { versionId, productId } = useParams()

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
        <AddRelationship />
      </TopBar>

      <div className="flex flex-row h-full">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Version" value={version.name} />
          <Attribute label="Description" value="Version Description" />
          <Attribute label="Relationships" value={relationships.length} />

          <div className="flex flex-row items-center gap-2 mt-4">
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
            </Button>
          </div>
        </div>
        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  )
}
