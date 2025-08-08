import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ConfirmButton from '@/components/forms/ConfirmButton'
import PageContent from '@/components/forms/PageContent'
import useRefetchQuery from '@/utils/useRefetchQuery'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { BreadcrumbItem, Tooltip } from '@heroui/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useProductQuery } from '../Product'
import { useVendorQuery } from '../Vendor'
import { useVersionQuery } from '../Version'
import CreateEditIDHelper from './CreateIDHelper'

interface IdentificationHelperListItemDTO {
  id: string
  category: string
  product_version_id: string
  metadata?: string
}

export const idHelperTypes = [
  {
    id: 'cpe',
    translationKey: 'identificationHelper.types.cpe',
    component: 'cpe' as const,
  },
  {
    id: 'hashes',
    translationKey: 'identificationHelper.types.hashes',
    component: 'hashes' as const,
  },
  {
    id: 'models',
    translationKey: 'identificationHelper.types.models',
    component: 'models' as const,
  },
  {
    id: 'purl',
    translationKey: 'identificationHelper.types.purl',
    component: 'purl' as const,
  },
  {
    id: 'sbom',
    translationKey: 'identificationHelper.types.sbom',
    component: 'sbom' as const,
  },
  {
    id: 'serial',
    translationKey: 'identificationHelper.types.serial',
    component: 'serial' as const,
  },
  {
    id: 'sku',
    translationKey: 'identificationHelper.types.sku',
    component: 'sku' as const,
  },
  {
    id: 'uri',
    translationKey: 'identificationHelper.types.uri',
    component: 'uri' as const,
  },
] as const

export type HelperTypeProps = (typeof idHelperTypes)[number]

function IdentificationItem({
  helper,
  helperType,
  onEdit,
  onDelete,
}: {
  helper: IdentificationHelperListItemDTO
  helperType: HelperTypeProps
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()

  // Helper function to format array data with "and more" pattern
  const formatArrayData = (items: string[]) => {
    if (!items || items.length === 0) return null
    const count = items.length
    const first = items[0]
    return count === 1
      ? first
      : `${first} ${t('identificationHelper.andMore', { count: count - 1 })}`
  }

  // Parse metadata to show relevant information
  const getDisplayInfo = () => {
    try {
      const metadata = JSON.parse(helper.metadata || '{}')

      switch (helperType.component) {
        case 'hashes':
          if (metadata.file_hashes && Array.isArray(metadata.file_hashes)) {
            const count = metadata.file_hashes.length
            const first = metadata.file_hashes[0]
            const display = first?.filename
            return count === 1
              ? display
              : `${display} ${t('identificationHelper.andMore', { count: count - 1 })}`
          }
          break
        case 'cpe':
          if (metadata.cpe) {
            return metadata.cpe
          }
          break
        case 'purl':
          if (metadata.purl) {
            return metadata.purl
          }
          break
        case 'models':
          if (metadata.models && Array.isArray(metadata.models)) {
            return formatArrayData(metadata.models)
          }
          break
        case 'serial':
          if (
            metadata.serial_numbers &&
            Array.isArray(metadata.serial_numbers)
          ) {
            return formatArrayData(metadata.serial_numbers)
          }
          break
        case 'sku':
          if (metadata.skus && Array.isArray(metadata.skus)) {
            return formatArrayData(metadata.skus)
          }
          break
        case 'sbom':
          if (metadata.sbom_urls && Array.isArray(metadata.sbom_urls)) {
            return formatArrayData(metadata.sbom_urls)
          }
          break
        case 'uri':
          if (metadata.uris && Array.isArray(metadata.uris)) {
            const count = metadata.uris.length
            const first = metadata.uris[0]
            const display = first?.namespace
              ? `${first.namespace}: ${first.uri}`
              : first?.uri
            return count === 1
              ? display
              : `${display} ${t('identificationHelper.andMore', { count: count - 1 })}`
          }
          break
      }
    } catch {
      // Fallback if JSON parsing fails
    }

    return t('identificationHelper.notConfigured')
  }

  const displayText = getDisplayInfo()

  return (
    <div className="group flex w-full flex-col justify-between gap-2 rounded-lg border-1 border-default-200 bg-gray-50 px-4 py-2 hover:bg-gray-100 hover:transition-background">
      <div className="flex items-center justify-between">
        <div className="flex grow flex-col gap-1">
          <div>
            <div className="text-sm text-default-500">
              {t(`${helperType.translationKey}.label`)}
            </div>
            <div className="truncate text-lg font-medium">{displayText}</div>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip
            content={t('identificationHelper.editHelper')}
            placement="top"
          >
            <Button
              isIconOnly
              variant="light"
              color="primary"
              size="sm"
              onPress={onEdit}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </Tooltip>
          <Tooltip
            content={t('identificationHelper.deleteHelper')}
            placement="top"
          >
            <ConfirmButton
              isIconOnly
              variant="light"
              color="danger"
              size="sm"
              confirmTitle={t('identificationHelper.deleteConfirmTitle')}
              confirmText={t('identificationHelper.deleteConfirmText', {
                label: t(`${helperType.translationKey}.label`).toLowerCase(),
              })}
              onConfirm={onDelete}
            >
              <FontAwesomeIcon icon={faTrash} />
            </ConfirmButton>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export function IdentificationGroup({
  helperType,
  helper,
  onClick,
  onEditHelper,
  onDeleteHelper,
  onAddHelper,
}: {
  helperType: HelperTypeProps
  helper?: IdentificationHelperListItemDTO
  onClick?: () => void
  onEditHelper?: (helperId: string) => void
  onDeleteHelper?: (helperId: string) => void
  onAddHelper?: () => void
}) {
  const { t } = useTranslation()

  return (
    <div
      className={`group flex flex-col gap-2 rounded-md border-1 border-slate-200 bg-white p-4 ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            {t(`${helperType.translationKey}.label`)}
          </p>
        </div>
        <p className="line-clamp-2 text-zinc-500">
          {t(`${helperType.translationKey}.description`)}
        </p>
      </div>

      {helper && (
        <IdentificationItem
          key={helper.id}
          helper={helper}
          helperType={helperType}
          onEdit={() => onEditHelper?.(helper.id)}
          onDelete={() => onDeleteHelper?.(helper.id)}
        />
      )}

      {!helper && (
        <Button
          variant="bordered"
          className="border-dashed border-gray text-gray"
          startContent={<FontAwesomeIcon icon={faEdit} />}
          onPress={onAddHelper}
        >
          {t('identificationHelper.addHelper', {
            label: t(`${helperType.translationKey}.label`),
          })}
        </Button>
      )}
    </div>
  )
}

export default function IdentificationOverview({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { versionId } = useParams()
  const { t } = useTranslation()
  const [editingHelper, setEditingHelper] = useState<{
    type: HelperTypeProps
    helperId: string
  } | null>(null)

  const { data: version } = useVersionQuery(versionId)
  const { data: product } = useProductQuery(version?.product_id)
  const { data: vendor } = useVendorQuery(product?.vendor_id)

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

  const deleteMutation = client.useMutation(
    'delete',
    '/api/v1/identification-helper/{id}',
    {
      onSettled: () => {
        identificationHelpersRequest.refetch()
      },
    },
  )

  const helpersByCategory = useMemo(() => {
    const helpers = identificationHelpersRequest.data || []
    const map = new Map<string, IdentificationHelperListItemDTO>()

    helpers.forEach((helper) => {
      map.set(helper.category, helper)
    })

    return map
  }, [identificationHelpersRequest.data])

  function handleDeleteHelper(helperId: string) {
    deleteMutation.mutate(
      {
        params: { path: { id: helperId } },
      },
      {
        onSuccess: () => {
          identificationHelpersRequest.refetch()
        },
      },
    )
  }

  function handleEditHelper(helperType: HelperTypeProps, helperId: string) {
    setEditingHelper({
      type: helperType,
      helperId,
    })
  }

  return (
    <PageContent>
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">
            {t('vendor.label', { count: 2 })}
          </BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
          <BreadcrumbItem isDisabled>
            {t('product.label', { count: 2 })}
          </BreadcrumbItem>
          <BreadcrumbItem href={`/products/${product?.id}`}>
            {product?.name}
          </BreadcrumbItem>
          <BreadcrumbItem isDisabled>
            {t('version.label', { count: 2 })}
          </BreadcrumbItem>
          <BreadcrumbItem href={`/product-versions/${version?.id}`}>
            {version?.name}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {t('identificationHelper.label', { count: 2 })}
          </BreadcrumbItem>
        </Breadcrumbs>
      )}

      <div className="flex w-full items-center justify-between rounded-md border-1 border-slate-200 bg-white p-4">
        <p className="text-xl font-semibold text-primary">
          {t('identificationHelper.label', { count: 2 })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {idHelperTypes.map((helperType) => {
          const helper = helpersByCategory.get(helperType.id as string)

          return (
            <IdentificationGroup
              key={helperType.id}
              helperType={helperType}
              helper={helper}
              onEditHelper={(helperId) =>
                handleEditHelper(helperType, helperId)
              }
              onDeleteHelper={handleDeleteHelper}
              onAddHelper={() => {
                setEditingHelper({
                  type: helperType,
                  helperId: '',
                })
              }}
            />
          )
        })}
      </div>

      {editingHelper && (
        <CreateEditIDHelper
          editData={{
            type: editingHelper.type,
            helperId: editingHelper.helperId,
          }}
          onClose={() => {
            setEditingHelper(null)
          }}
        />
      )}
    </PageContent>
  )
}
