import client from '@/client'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { useProductQuery } from '@/routes/Product'
import {
  ProductFamilyChains,
  useProductFamilyListQuery,
} from '@/routes/ProductFamilies'
import { useErrorLocalization } from '@/utils/useErrorLocalization'
import useRouter from '@/utils/useRouter'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Alert,
  Autocomplete,
  AutocompleteItem,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SelectItem,
  Spinner,
} from '@heroui/react'
import { t } from 'i18next'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

interface CreateEditProductProps {
  vendorId: string
}

export type ProductProps = {
  id?: string
  name: string
  description: string | undefined
  type: string
  vendor_id: string
  family_id: string | undefined | null
}

export function useProductMutation({
  product,
}: {
  vendorId: string
  product: ProductProps
}) {
  const { navigate } = useRouter()
  const isCreateForm = !product.id

  const onSuccess = useCallback(
    (id: string) => {
      navigate(`/products/${id}`, {
        replace: true,
        state: {
          shouldRefetch: true,
        },
      })
    },
    [navigate],
  )

  const createMutation = client.useMutation('post', '/api/v1/products', {
    onSuccess: (res) => {
      onSuccess(res.id)
    },
  })
  const updateMutation = client.useMutation('put', '/api/v1/products/{id}', {
    params: { path: { id: product.id } },
    onSuccess: (res) => {
      onSuccess(res.id)
    },
  })

  const mutateProduct = useCallback(() => {
    const body = {
      name: product.name,
      description: product.description,
      type: product.type,
      vendor_id: product.vendor_id,
      family_id: product.family_id,
    }

    if (isCreateForm) {
      createMutation.mutate({ body })
    } else {
      updateMutation.mutate({
        body,
        params: { path: { id: product.id || '' } },
      })
    }
  }, [product, isCreateForm, createMutation, updateMutation])

  const mutation = isCreateForm ? createMutation : updateMutation

  return { mutateProduct, isPending: mutation.isPending, error: mutation.error }
}

export function AddProductButton({ vendorId }: CreateEditProductProps) {
  const { navigateToModal } = useRouter()
  const { t } = useTranslation()

  return (
    <Button
      color="primary"
      startContent={<FontAwesomeIcon icon={faAdd} />}
      onPress={() => {
        navigateToModal(
          `/vendors/${vendorId}/products/create`,
          `/vendors/${vendorId}`,
        )
      }}
    >
      {t('common.createObject', {
        label: t('product.label'),
      })}
    </Button>
  )
}

export default function CreateEditProduct() {
  const { navigate, location } = useRouter()
  const { productId, vendorId } = useParams()
  const isCreateForm = !productId

  const { data: families } = useProductFamilyListQuery()
  const { data: previousData, isLoading } = useProductQuery(productId || '')

  const [product, setProduct] = useState<ProductProps>({
    id: '',
    name: '',
    description: '',
    type: 'software',
    vendor_id: vendorId || '',
    family_id: undefined,
  })

  useEffect(() => {
    if (previousData) {
      setProduct({
        id: previousData.id,
        name: previousData.name,
        description: previousData.description || '',
        type: previousData.type,
        vendor_id: previousData.vendor_id || '',
        family_id: previousData.family_id,
      })
    }
  }, [previousData])

  const onClose = () => {
    setProduct({
      name: '',
      description: '',
      type: 'software',
      vendor_id: vendorId || '',
      family_id: undefined,
    })

    navigate(location.state.returnTo ?? `/products/${product.id}`, {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }

  const { mutateProduct, isPending, error } = useProductMutation({
    vendorId: vendorId || '',
    product,
  })

  const errorHelper = useErrorLocalization(error)

  if (!isCreateForm && isLoading) {
    return (
      <Modal isOpen>
        <ModalBody>
          <Spinner />
        </ModalBody>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen
      onOpenChange={onClose}
      size="lg"
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t(isCreateForm ? 'common.createObject' : 'common.editObject', {
            label: t('product.label'),
          })}
        </ModalHeader>
        <ModalBody className="gap-4">
          {error ? (
            <Alert color="danger" className="mb-4">
              {t('form.errors')}
            </Alert>
          ) : null}

          <Select
            label="Type"
            placeholder="Select a type"
            className="w-full"
            selectedKeys={[product.type]}
            onChange={(e) => setProduct({ ...product, type: e.target.value })}
          >
            <SelectItem key="firmware">Firmware</SelectItem>
            <SelectItem key="software">Software</SelectItem>
            <SelectItem key="hardware">Hardware</SelectItem>
          </Select>

          <Input
            label="Name"
            placeholder="Enter the product name..."
            className="w-full"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            autoFocus
            type="text"
            isInvalid={errorHelper.isFieldInvalid('Name')}
            errorMessage={errorHelper.getFieldErrorMessage('Name')}
          />

          <Textarea
            label="Description"
            multiple
            placeholder="Enter the description..."
            className="w-full"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            type="text"
          />

          <Autocomplete
            labelPlacement="outside"
            label={t('form.fields.productFamily')}
            selectedKey={product.family_id || ''}
            variant="bordered"
            inputProps={{
              classNames: {
                inputWrapper: 'border-1 shadow-none',
              },
            }}
            onSelectionChange={(key) => {
              if (key === null) {
                setProduct({ ...product, family_id: undefined })
                return
              }

              setProduct({
                ...product,
                family_id: key === '' ? undefined : key?.toString(),
              })
            }}
          >
            {families
              // .filter((item) => item.id !== family.id)
              .map((item) => (
                <AutocompleteItem
                  key={item.id.toString()}
                  textValue={item.name}
                >
                  <ProductFamilyChains item={item} />
                </AutocompleteItem>
              ))}
          </Autocomplete>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="primary" onPress={mutateProduct} isLoading={isPending}>
            {isCreateForm ? t('common.create') : t('common.save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
