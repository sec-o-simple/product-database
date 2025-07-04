import client from '@/client'
import IconButton from '@/components/forms/IconButton'
import Select from '@/components/forms/Select'
import { useProductQuery } from '@/routes/Product'
import { useProductListQuery } from '@/routes/Products'
import { useVersionQuery } from '@/routes/Version'
import useRouter from '@/utils/useRouter'
import { faAdd, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import { SelectItem } from '@heroui/select'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const relationshipTypes = [
  'default_component_of',
  'external_component_of',
  'installed_on',
  'installed_with',
  'optional_component_of',
]

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

interface ProductVersionSelectProps {
  productId?: string
  selectedVersionIds?: string[]
  onChange?: (versionIds: string[]) => void
  isDisabled?: boolean
}

function ProductVersionSelect({
  productId,
  selectedVersionIds = [],
  onChange,
  isDisabled = false,
}: ProductVersionSelectProps) {
  const { data: versions } = client.useQuery(
    'get',
    `/api/v1/products/{id}/versions`,
    {
      params: {
        path: {
          id: productId || '',
        },
      },
    },
    {
      enabled: !!productId,
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value.split(',').filter((v) => v !== 'all')
    onChange?.(!value[0].length ? [] : value)
  }

  return (
    <Select
      name="sourceVersions"
      isDisabled={isDisabled}
      selectionMode="multiple"
      className="w-full"
      selectedKeys={selectedVersionIds}
      onChange={handleChange}
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
  )
}

interface RelationshipSelectionTableProps {
  products: { id: string; full_name: string }[]
  selectedProducts: {
    product: { id: string; full_name: string }
    versionIds: string[]
  }[]
  onSelectionChange?: (
    selectedProducts: {
      product: { id: string; full_name: string }
      versionIds: string[]
    }[],
  ) => void
  isDisabled?: boolean
  label?: string
}

function RelationshipSelectionTable({
  products,
  selectedProducts,
  onSelectionChange,
  isDisabled = false,
  label = 'Items',
}: RelationshipSelectionTableProps) {
  const { t } = useTranslation()

  const handleAddProduct = () => {
    const newProduct = {
      product: { id: '', full_name: '' },
      versionIds: [],
    }
    onSelectionChange?.([...selectedProducts, newProduct])
  }

  const handleRemoveProduct = (index: number) => {
    const updated = selectedProducts.filter((_, i) => i !== index)
    onSelectionChange?.(updated)
  }

  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find((p) => p.id === productId)
    if (!selectedProduct) return
    const updated = [...selectedProducts]
    updated[index] = {
      product: selectedProduct,
      versionIds: [],
    }
    onSelectionChange?.(updated)
  }

  const handleVersionChange = (index: number, versionIds: string[]) => {
    const updated = [...selectedProducts]
    updated[index] = {
      ...updated[index],
      versionIds,
    }
    onSelectionChange?.(updated)
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{label}</h2>
        {!isDisabled && (
          <Button variant="light" color="primary" onPress={handleAddProduct}>
            {t('common.addObject', {
              label: t('product.label'),
            })}
          </Button>
        )}
      </div>
      <Table removeWrapper>
        <TableHeader>
          <TableColumn width="45%">{t('product.label')}</TableColumn>
          <TableColumn width="45%">{t('version.label')}</TableColumn>
          <TableColumn width="10%">{t('common.actions')}</TableColumn>
        </TableHeader>
        <TableBody>
          {selectedProducts.map((item, index) => (
            <TableRow key={`${item.product.id}-${index}`}>
              <TableCell>
                <Select
                  isDisabled={isDisabled}
                  name="sourceProducts"
                  className="w-full"
                  selectedKeys={item.product.id ? [item.product.id] : []}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                >
                  <>
                    {products?.map((product) => (
                      <SelectItem key={product.id}>
                        {product.full_name}
                      </SelectItem>
                    ))}
                  </>
                </Select>
              </TableCell>

              <TableCell>
                <ProductVersionSelect
                  isDisabled={isDisabled}
                  productId={item.product.id || undefined}
                  selectedVersionIds={item.versionIds}
                  onChange={(versionIds) =>
                    handleVersionChange(index, versionIds)
                  }
                />
              </TableCell>

              <TableCell>
                <IconButton
                  icon={faTrash}
                  onPress={() => handleRemoveProduct(index)}
                  isDisabled={isDisabled}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function CreateRelationship() {
  const {
    params: { versionId, category },
    navigate,
  } = useRouter()

  const { t } = useTranslation()
  const isCreateForm = !category

  const [relationshipType, setRelationshipType] = useState<string>(
    category || '',
  )
  const [sourceProducts, setSourceProducts] = useState<
    {
      product: { id: string; full_name: string }
      versionIds: string[]
    }[]
  >([])

  const [targetProducts, setTargetProducts] = useState<
    {
      product: { id: string; full_name: string }
      versionIds: string[]
    }[]
  >([])

  const { data: products } = useProductListQuery()
  const { data: version } = useVersionQuery(versionId)
  const { data: product } = useProductQuery(version?.product_id)

  // In case we are editing an existing relationship, fetch existing relationships
  const { data: relationships } = client.useQuery(
    'get',
    '/api/v1/product-versions/{id}/relationships',
    {
      params: {
        path: {
          id: versionId || '',
        },
      },
    },
    {
      enabled: !!versionId && !!category, // Only fetch if versionId and category are provided
    },
  )

  const onClose = () => {
    navigate(`/product-versions/${versionId}`, {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }

  const createMutation = client.useMutation('post', '/api/v1/relationships', {
    onSuccess: () => {
      onClose()
    },
  })
  const updateMutation = client.useMutation('put', '/api/v1/relationships', {
    onSuccess: () => {
      onClose()
    },
  })

  const canSubmit = useMemo(() => {
    const hasValidSourceProducts = sourceProducts.some(
      (item) => item.product.id && item.versionIds.length > 0,
    )
    const hasValidTargetProducts = targetProducts.some(
      (item) => item.product.id && item.versionIds.length > 0,
    )

    return hasValidSourceProducts && hasValidTargetProducts && relationshipType
  }, [sourceProducts, targetProducts, relationshipType])

  const handleCreateRelationship = () => {
    if (!canSubmit) {
      return
    }

    // Filter out products without versions
    const filteredSourceProducts = sourceProducts.filter(
      (item) => item.product.id && item.versionIds.length > 0,
    )
    const filteredTargetProducts = targetProducts.filter(
      (item) => item.product.id && item.versionIds.length > 0,
    )

    const sourceVersions = filteredSourceProducts.flatMap((p) => p.versionIds)
    const targetVersions = filteredTargetProducts.flatMap((p) => p.versionIds)

    if (isCreateForm) {
      createMutation.mutate({
        body: {
          category: relationshipType,
          source_node_ids: sourceVersions,
          target_node_ids: targetVersions,
        },
      })
    } else {
      updateMutation.mutate({
        body: {
          category: relationshipType,
          source_node_id: sourceVersions[0],
          target_node_ids: targetVersions,
          previous_category: category,
        },
      })
    }
  }

  useEffect(() => {
    if (!product || !version) return

    setSourceProducts([
      {
        product: { id: product.id, full_name: product.full_name },
        versionIds: [version.id],
      },
    ])

    if (!relationships) return

    const relationshipGroup = relationships.find(
      (group) => group.category === category,
    )

    if (!relationshipGroup) return

    setTargetProducts(
      relationshipGroup.products.map((p) => ({
        product: { id: p.product.id, full_name: p.product.full_name },
        versionIds: p.version_relationships.map((vr) => vr.version.id),
      })),
    )
  }, [relationships, product, version, category])

  if (!products || !version || !product) {
    return null
  }

  return (
    <Modal isOpen isDismissable={false} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t(isCreateForm ? 'common.createObject' : 'common.editObject', {
            label: t('relationship.label'),
          })}
        </ModalHeader>
        <ModalBody className="gap-4">
          <RelationshipSelectionTable
            products={products}
            selectedProducts={sourceProducts}
            onSelectionChange={setSourceProducts}
            label={t('relationship.sourceProduct.label', {
              count: isCreateForm ? 2 : 1,
            })}
            isDisabled={!isCreateForm}
          />

          <Select
            label={t('form.fields.relationshipCategory')}
            placeholder={t('form.select')}
            selectionMode="single"
            selectedKeys={relationshipType ? [relationshipType] : []}
            onChange={(key) => setRelationshipType(key.target.value as string)}
          >
            {relationshipTypes.map((type) => (
              <SelectItem key={type}>
                {t(`relationship.category.${type}`)}
              </SelectItem>
            ))}
          </Select>

          <RelationshipSelectionTable
            products={products}
            selectedProducts={targetProducts}
            onSelectionChange={setTargetProducts}
            label={t('relationship.targetProduct.label', {
              count: 2,
            })}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            color="primary"
            onPress={handleCreateRelationship}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isDisabled={!canSubmit}
          >
            {t(isCreateForm ? 'common.create' : 'common.save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
