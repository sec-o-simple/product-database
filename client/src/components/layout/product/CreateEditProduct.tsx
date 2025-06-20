import client from '@/client'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { getProducts } from '@/routes/Vendor'
import useRouter from '@/utils/useRouter'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SelectItem,
} from '@heroui/react'
import { useCallback, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

interface CreateEditProductProps {
  vendorId: string
}

export type ProductProps = {
  id?: string
  name: string
  description: string
  type: string
  vendor_id: string
}

export function useProductMutation({
  vendorId,
  product,
  onClose,
  client,
}: {
  vendorId: string
  product: ProductProps
  onClose: () => void
  client: any
}) {
  const isCreateForm = !product.id

  const onSuccess = () => {
    onClose()
  }

  const mutation = isCreateForm
    ? client.useMutation('post', '/api/v1/products', { onSuccess })
    : client.useMutation('put', '/api/v1/products/{id}', {
        params: { path: { id: product.id } },
        onSuccess,
      })

  const mutateProduct = useCallback(() => {
    const body = {
      name: product.name,
      description: product.description,
      type: product.type,
      vendor_id: vendorId,
    }

    mutation.mutate(
      isCreateForm
        ? { body }
        : { body, params: { path: { id: product.vendor_id } } },
    )
  }, [mutation, product, vendorId])

  return {
    mutateProduct,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}

export function AddProductButton({ vendorId }: CreateEditProductProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Button
      color="primary"
      startContent={<FontAwesomeIcon icon={faAdd} />}
      onPress={() => {
        navigate(`vendors/${vendorId}/products/create`, {
          replace: true,
          state: {
            backgroundLocation: location,
          },
        })
      }}
    >
      Add Product
    </Button>
  )
}

export default function CreateEditProduct() {
  const { navigate } = useRouter()
  const { vendorId, productId } = useParams()
  const isCreateForm = !productId

  const { data: previousData } = getProducts(productId) as {
    data: ProductProps
  }

  const [product, setProduct] = useState<ProductProps>({
    name: previousData?.name || '',
    description: previousData?.description || '',
    type: previousData?.type || 'software',
    vendor_id: vendorId || '',
  })

  const onClose = () => {
    setProduct({
      name: '',
      description: '',
      type: 'software',
      vendor_id: vendorId || '',
    })

    navigate(`/vendors/${vendorId}`, {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }

  const { mutateProduct, isPending, error } = useProductMutation({
    vendorId: product.vendor_id,
    product,
    onClose: onClose,
    client,
  })

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
          {isCreateForm ? 'Add New Product' : 'Edit Product'}
        </ModalHeader>
        <ModalBody className="gap-4">
          {error && (
            <div className="text-red-500">
              {error.title || 'An error occurred while creating the product.'}
            </div>
          )}

          <Select
            label="Type"
            placeholder="Select a type"
            className="w-full"
            value={product.type}
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
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={mutateProduct} isLoading={isPending}>
            {isCreateForm ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
