import client from '@/client'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
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
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

interface CreateEditProductProps {
  vendorId: string
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
  const { vendorId, productId } = useParams<{
    vendorId?: string
    productId?: string
  }>()
  const navigate = useNavigate()
  const isCreateForm = !productId

  const { data: previousData } = client.useQuery(
    'get',
    '/api/v1/products/{id}',
    {
      params: {
        path: {
          id: productId || '',
        },
      },
    },
  )

  const [product, setProduct] = useState<{
    name: string
    description: string
    type: string
    vendor_id: string
  }>({
    name: previousData?.name || '',
    description: previousData?.description || '',
    type: previousData?.type || 'software',
    vendor_id: vendorId || '',
  })

  const mutation = isCreateForm
    ? client.useMutation('post', '/api/v1/products', {
        onSuccess: () => {
          onClose()

          navigate(0)
        },
      })
    : client.useMutation('put', '/api/v1/products/{id}', {
        params: {
          path: {
            id: product.vendor_id || '',
          },
        },
        onSuccess: () => {
          setProduct({
            name: '',
            description: '',
            type: 'software',
            vendor_id: vendorId || '',
          })
          onClose()
        },
      })

  // We need a vendorId to create a product
  if (!vendorId && isCreateForm) {
    return null
  }

  function handleCreateProduct() {
    mutation.mutate({
      body: {
        name,
        description,
        type,
        vendor_id: vendorId ?? '',
      },
    })
  }

  function handleUpdateProduct() {
    mutation.mutate({
      body: {
        name,
        description,
        type,
        vendor_id: vendorId ?? '',
      },
    })
  }

  const onClose = () => {
    navigate(-1)
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
        <ModalHeader className="flex flex-col gap-1">Add Product</ModalHeader>
        <ModalBody className="gap-4">
          {mutation.error && (
            <div className="text-red-500">
              {mutation.error.title ||
                'An error occurred while creating the product.'}
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
          <Button
            color="primary"
            onPress={isCreateForm ? handleCreateProduct : handleUpdateProduct}
            isLoading={mutation.isPending}
          >
            {isCreateForm ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
