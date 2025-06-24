import client from '@/client'
import { Input, Textarea } from '@/components/forms/Input'
import { useVendorQuery } from '@/routes/Vendor'
import { VendorProps } from '@/routes/Vendors'
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
  Spinner,
} from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export function useVendorMutation({
  vendor,
  onClose,
}: {
  vendor: VendorProps
  onClose: () => void
}) {
  const onSuccess = useCallback(() => {
    onClose()
  }, [onClose])

  const isCreateForm = !vendor.id

  const createMutation = client.useMutation('post', '/api/v1/vendors', {
    onSuccess,
  })
  const updateMutation = client.useMutation('put', '/api/v1/vendors/{id}', {
    onSuccess,
    params: { path: { id: vendor.id } },
  })

  const mutateVendor = useCallback(() => {
    const body = {
      name: vendor.name,
      description: vendor.description,
    }
    if (isCreateForm) {
      createMutation.mutate({ body })
    } else {
      updateMutation.mutate({
        body,
        params: { path: { id: vendor.id || '' } },
      })
    }
  }, [isCreateForm, createMutation, updateMutation, vendor])

  const mutation = isCreateForm ? createMutation : updateMutation

  return { mutateVendor, isPending: mutation.isPending, error: mutation.error }
}

export function CreateVendorButton() {
  const { navigateToModal } = useRouter()

  return (
    <Button color="primary" onPress={() => navigateToModal('/vendors/create')}>
      <FontAwesomeIcon icon={faAdd} className="mr-2" />
      Create Vendor
    </Button>
  )
}

export default function CreateEditVendor() {
  const { navigate, location } = useRouter()
  const { vendorId } = useParams()
  const isCreateForm = !vendorId

  const { data: previousData, isLoading } = useVendorQuery(vendorId || '')

  const [vendor, setVendor] = useState<VendorProps>({
    id: previousData?.id || '',
    name: previousData?.name || '',
    description: previousData?.description || '',
  })

  useEffect(() => {
    if (previousData) {
      setVendor({
        id: previousData.id,
        name: previousData.name,
        description: previousData.description,
      })
    }
  }, [previousData])

  const onClose = () => {
    setVendor({ name: '', description: '' })

    navigate(location.state.returnTo ?? '/vendors', {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }

  const { mutateVendor, isPending, error } = useVendorMutation({
    vendor,
    onClose: onClose,
  })

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
          {isCreateForm ? 'Create Vendor' : 'Edit Vendor'}
        </ModalHeader>
        <ModalBody className="gap-4">
          {error ? (
            <div className="text-red-500">
              Error: {error?.title || 'Failed to create vendor'}
            </div>
          ) : null}

          <Input
            label="Name"
            placeholder="Enter the product name..."
            className="w-full"
            value={vendor.name}
            onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
            autoFocus
            type="text"
          />

          <Textarea
            label="Description"
            multiple
            placeholder="Enter the description..."
            className="w-full"
            value={vendor.description}
            onChange={(e) =>
              setVendor({ ...vendor, description: e.target.value })
            }
            type="text"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={mutateVendor} isLoading={isPending}>
            {isCreateForm ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
