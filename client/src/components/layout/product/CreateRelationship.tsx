import client from '@/client'
import Select from '@/components/forms/Select'
import { useProductQuery } from '@/routes/Product'
import { useProductListQuery } from '@/routes/Products'
import { useVersionQuery } from '@/routes/Version'
import useRouter from '@/utils/useRouter'
import { faAdd, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import { Button } from '@heroui/react'
import { SelectItem } from '@heroui/select'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface RelationshipProps {
  sourceVersions: { name: string; id: string }[]
  targetVersions: { name: string; id: string }[]
  relationshipType: string
  description: string
}

const relationshipTypes = [
  'Installed On',
  'Installed With',
  'Optional Component Of',
  'Default Component Of',
  'External Component Of',
]

function ProductBox({
  product,
  version,
}: {
  product?: { full_name: string; id: string }
  version?: { name: string; id: string }
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center rounded-lg border border-gray bg-white p-2 px-4">
      <div className="flex flex-col gap-1">
        <p>{product?.full_name ?? '-/-'}</p>
      </div>

      <p className="text-sm text-zinc-500">
        {t('version.label')}: {version?.name ?? '-/-'}
      </p>
    </div>
  )
}

export function AddRelationshipButton({
  versionId,
  returnTo,
}: {
  versionId: string
  returnTo?: string
}) {
  const { t } = useTranslation()
  const { navigateToModal } = useRouter()

  return (
    <Button
      color="primary"
      startContent={<FontAwesomeIcon icon={faAdd} />}
      onPress={() =>
        navigateToModal(
          `/product-versions/${versionId}/relationships/create`,
          returnTo,
        )
      }
    >
      {t('common.createObject', {
        label: t('relationship.label'),
      })}
    </Button>
  )
}

interface ProductVersionSelectionProps {
  initialProductId?: string
  selectedVersions: { id: string; name: string }[]
  onChange?: (
    selectedVersions: { id: string; name: string }[],
    selectedProduct: { id: string; full_name: string } | undefined,
  ) => void
  products?: { id: string; full_name: string }[]
  label: string
}

function ProductVersionSelection({
  products,
  initialProductId,
  selectedVersions = [],
  onChange,
  label,
}: ProductVersionSelectionProps) {
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >(initialProductId)

  const { data: versions } = client.useQuery(
    'get',
    `/api/v1/products/{id}/versions`,
    {
      params: {
        path: {
          id: selectedProductId || '',
        },
      },
    },
    {
      enabled: !!selectedProductId,
    },
  )

  const handleSelect = (key: React.ChangeEvent<HTMLSelectElement>) => {
    const value = key.target.value.split(',').filter((v) => v !== 'all')
    onChange?.(
      versions?.filter((v) => value.includes(v.id)) || [],
      products?.find((p) => p.id === selectedProductId),
    )
  }

  return (
    <div className="flex flex-row gap-2">
      <Select
        label={label}
        name="sourceProducts"
        className="w-2/3"
        selectedKeys={selectedProductId ? [selectedProductId] : []}
        onChange={(productId) => {
          setSelectedProductId(productId.target.value)
          onChange?.(
            [],
            products?.find((p) => p.id === productId.target.value),
          ) // Reset selected versions when product changes
        }}
      >
        <>
          {products?.map((product) => (
            <SelectItem key={product.id}>{product.full_name}</SelectItem>
          ))}
        </>
      </Select>

      <Select
        label="Version"
        name="sourceVersions"
        selectionMode="multiple"
        className="w-1/3"
        selectedKeys={selectedVersions.map((v) => v.id)}
        onChange={handleSelect}
        renderValue={(value) => {
          if (value.length === versions?.length) return 'All'
          return value
            .map((v) => versions?.find((version) => version.id === v.key)?.name)
            .join(', ')
        }}
      >
        <>
          {versions?.map((version) => (
            <SelectItem key={version.id}>{version.name}</SelectItem>
          ))}
        </>
      </Select>
    </div>
  )
}

export default function CreateRelationship() {
  const {
    params: { versionId },
    navigate,
  } = useRouter()

  const { t } = useTranslation()

  const [selected, setSelected] = useState<RelationshipProps>({
    sourceVersions: [],
    targetVersions: [],
    relationshipType: '',
    description: '',
  })

  const { data: products } = useProductListQuery()
  const { data: version } = useVersionQuery(versionId)
  const { data: product } = useProductQuery(version?.product_id)

  const onClose = () => {
    navigate(`/product-versions/${versionId}`, {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }

  const mutation = client.useMutation('post', '/api/v1/relationships', {
    onSuccess: () => {
      onClose()
    },
  })

  const canSubmit = useMemo(() => {
    return (
      selected.sourceVersions.length > 0 &&
      selected.targetVersions.length > 0 &&
      selected.relationshipType
    )
  }, [selected])

  const handleCreateRelationship = () => {
    if (!canSubmit) {
      return
    }

    mutation.mutate({
      body: {
        category: 'installed_on',
        source_node_id: selected.sourceVersions[0].id,
        target_node_id: selected.targetVersions[0].id,
      },
    })
  }

  const [sourceProduct, setSourceProduct] = useState<
    | {
        id: string
        full_name: string
      }
    | undefined
  >(undefined)

  const [targetProduct, setTargetProduct] = useState<
    | {
        id: string
        full_name: string
      }
    | undefined
  >(undefined)

  useEffect(() => {
    if (product) {
      setSourceProduct(product)
    }
    if (version) {
      setSelected((prevState) => ({
        ...prevState,
        sourceVersions: [version],
      }))
    }
  }, [product, version])

  if (!products || !version || !product) {
    return null
  }

  return (
    <Modal isOpen isDismissable={false} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t('common.createObject', {
            label: t('relationship.label'),
          })}
        </ModalHeader>
        <ModalBody className="gap-4">
          <ProductVersionSelection
            label="Source Product"
            products={products}
            initialProductId={version.product_id}
            selectedVersions={selected.sourceVersions}
            onChange={(selectedVersions, selectedProduct) => {
              setSelected((prevState) => ({
                ...prevState,
                sourceVersions: selectedVersions,
              }))
              setSourceProduct(selectedProduct)
            }}
          />

          <ProductVersionSelection
            label="Target Product"
            products={products}
            selectedVersions={selected.targetVersions}
            onChange={(selectedVersions, selectedProduct) => {
              setSelected((prevState) => ({
                ...prevState,
                targetVersions: selectedVersions,
              }))
              setTargetProduct(selectedProduct)
            }}
          />

          <Select
            label="Relationship Type"
            placeholder="Select a type"
            selectionMode="single"
            selectedKeys={
              selected.relationshipType ? [selected.relationshipType] : []
            }
            onChange={(key) =>
              setSelected((prevState) => ({
                ...prevState,
                relationshipType: key.target.value as string,
              }))
            }
          >
            {relationshipTypes.map((type) => (
              <SelectItem key={type}>{type}</SelectItem>
            ))}
          </Select>

          <div className="flex flex-row items-center justify-around gap-2 rounded-md bg-gray-100 p-4">
            <ProductBox
              product={sourceProduct}
              version={
                selected.sourceVersions.length
                  ? selected.sourceVersions[0]
                  : undefined
              }
            />

            <div className="flex flex-col items-center space-y-2">
              <FontAwesomeIcon
                icon={faArrowRight}
                size="xl"
                className="text-primary"
              />
              <p className="text-sm text-zinc-500">
                {relationshipTypes.find(
                  (type) => type === selected.relationshipType,
                )}
              </p>
            </div>

            <ProductBox
              product={targetProduct}
              version={
                selected.targetVersions.length
                  ? selected.targetVersions[0]
                  : undefined
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            color="primary"
            onPress={handleCreateRelationship}
            isLoading={mutation.isPending}
            isDisabled={!canSubmit}
          >
            {t('common.create')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
