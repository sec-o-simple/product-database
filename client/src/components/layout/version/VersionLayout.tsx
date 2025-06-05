import IconButton from '@/components/forms/IconButton'
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import { Chip } from '@heroui/chip'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import AddRelationship from '../product/AddRelationship'
import { UserAvatar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'
import { getProductById } from '../product/ProductLayout'
import History from '@/components/forms/HistoryButton'
import { Button } from '@heroui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { idHelperTypes } from '@/routes/Version'
import { IdentificationGroup } from '@/routes/IdentificationHelper/IdentificationOverview'

export function getProductVersionById(productId: string, versionId: string) {
  const product = getProductById(productId)

  return {
    product: product,
    version: product?.versions?.find((v) => String(v.id) === versionId),
  }
}

export default function VersionLayout() {
  const { productId, versionId } = useParams()
  const navigate = useNavigate()

  const { product, version } = getProductVersionById(
    productId || '',
    versionId || '',
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-2 text-2xl font-bold">
          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
          <p>Product: {product?.name}</p>

          <Chip variant="flat" className="rounded-md ml-2">
            Version: {version?.name || 'Unknown'}
          </Chip>
        </span>

        <div className="flex flex-row gap-4">
          <History />

          <AddRelationship />

          <UserAvatar />
        </div>
      </div>

      <div className="flex flex-row h-full flex-grow">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Version" value={version?.name ?? ''} />

          <Attribute label="Description" value={version?.description ?? ''} />

          <Attribute label="Relationships" value="4" />

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
          {idHelperTypes.map((type) => (
            <IdentificationGroup
              key={type.id}
              onClick={() =>
                navigate(
                  `/products/${productId}/versions/${versionId}/identification-helper/${type.id}`,
                )
              }
              label={type.label}
              description={type.description}
              items={[]}
            />
          ))}
        </div>

        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
