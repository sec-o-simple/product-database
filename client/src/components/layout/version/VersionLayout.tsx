import client from '@/client'
import IconButton from '@/components/forms/IconButton'
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import AddRelationship from '../product/AddRelationship'
import { Attribute } from '../vendor/VendorLayout'

export default function VersionLayout() {
  const navigate = useNavigate()
  const { productId, versionId } = useParams()

  const { data: version } = client.useQuery(
    'get',
    `/api/v1/products/{id}/versions/{versionID}`,
    {
      params: {
        path: {
          id: productId || '',
          versionID: versionId || '',
        },
      },
    },
  )

  if (!version) {
    return null
  }

  return (
    <div className="flex h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-2 text-2xl font-bold">
          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
          <p>Product {version.product_name || ''} - Relationships</p>

          <Chip variant="flat" className="rounded-md ml-2">
            Version: {version.name}
          </Chip>
        </span>

        <div className="flex flex-row gap-4">
          <AddRelationship />
        </div>
      </div>

      <div className="flex flex-row h-full">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Version" value={version.name} />
          <Attribute label="Description" value="Version Description" />

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
    </div>
  )
}
