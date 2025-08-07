import ConfirmButton from '@/components/forms/ConfirmButton'
import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import {
  HelperTypeProps,
  idHelperTypes,
} from '@/routes/IdentificationHelper/IdentificationOverview'
import { DeleteProduct, useProductQuery } from '@/routes/Product'
import { useVendorQuery } from '@/routes/Vendor'
import useRouter from '@/utils/useRouter'
import { faAdd, faFileExport } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import config from '../../../config/env'
import { TopBar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'
import { AddVersionButton } from '../version/CreateEditVersion'

export function AddIdHelper({
  onAdd,
  isIconOnly = false,
  isDisabled,
}: {
  onAdd?: (helper: HelperTypeProps) => void
  isIconOnly?: boolean
  isDisabled?: (helper: HelperTypeProps) => boolean
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color="primary"
          isIconOnly={isIconOnly}
          variant="flat"
          startContent={<FontAwesomeIcon icon={faAdd} />}
        >
          {!isIconOnly && 'Add ID Helper'}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        closeOnSelect={false}
        disabledKeys={idHelperTypes
          .filter((type) => isDisabled?.(type))
          .map((type) => String(type.id))}
      >
        <DropdownSection title="Helper Types">
          {idHelperTypes.map((type) => (
            <DropdownItem key={type.id} onPress={() => onAdd?.(type)}>
              {type.label}
            </DropdownItem>
          ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ProductLayout() {
  const {
    params: { productId },
    navigateToModal,
  } = useRouter()
  const { t } = useTranslation()
  const { data: product } = useProductQuery(productId || '')
  const { data: vendor } = useVendorQuery(product?.vendor_id || '')

  const handleExport = async (includeAllVersions: boolean) => {
    if (!productId) return
    try {
      // build query params if needed
      const params = new URLSearchParams()
      if (includeAllVersions) {
        params.set('all_versions', 'true') // adjust to whatever backend expects
      }

      const res = await fetch(
        `${config.apiBaseUrl}/api/v1/products/${encodeURIComponent(productId)}/export?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (!res.ok) {
        // handle error UI accordingly
        const errText = await res.text()
        console.error('Export failed:', errText, res)
        return
      }

      const payload = await res.json()
      downloadJSON(payload, `product-${productId}-export.json`)
    } catch (e) {
      console.error('Export error:', e)
    }
  }

  if (!product) {
    return null
  }

  return (
    <PageContainer>
      <TopBar
        title={`${t('product.label')}: ${product.name}`}
        backLink={`/vendors/${product.vendor_id}`}
        historyLink={`/products/${product.id}/history`}
        exportButton={
          <ConfirmButton
            confirmText="Are you sure you want to export this product?"
            confirmContent={
              <div>
                <Checkbox>Include all versions</Checkbox>
              </div>
            }
            variant="light"
            color="primary"
            confirmTitle="Export Product"
            onConfirm={async () => await handleExport(true)}
          >
            <FontAwesomeIcon icon={faFileExport} />
            Export
          </ConfirmButton>
        }
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
