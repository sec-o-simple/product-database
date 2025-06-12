import client from '@/client'
import { Input, Textarea } from '@/components/forms/Input'
import { faAdd, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ButtonProps } from '@heroui/button'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'
import { useState } from 'react'

interface CreateEditVendorProps {
  vendor?: any
  onCreate?: () => void
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
}

export default function CreateEditVendor({
  vendor: initialVendor,
  onCreate,
  variant = 'solid',
  color = 'primary',
}: CreateEditVendorProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const isCreateForm = !initialVendor

  const [vendor, setVendor] = useState<any>({
    name: initialVendor?.name || '',
    description: initialVendor?.description || '',
  })

  const mutation = isCreateForm
    ? client.useMutation('post', '/api/v1/vendors', {
        onSuccess: () => {
          setVendor({ name: '', description: '' })
          onClose()
          onCreate?.()
        },
      })
    : client.useMutation('put', '/api/v1/vendors/{id}', {
        params: {
          path: {
            id: initialVendor?.id || '',
          },
        },
        onSuccess: () => {
          setVendor({ name: '', description: '' })
          onClose()
          onCreate?.()
        },
      })

  function handleCreateVendor() {
    mutation.mutate({
      body: {
        name: vendor.name,
        description: vendor.description,
      },
    })
  }

  function handleUpdateVendor() {
    mutation.mutate({
      body: {
        name: vendor.name,
        description: vendor.description,
      },
    })
  }

  return (
    <>
      <Button
        variant={variant}
        color={color}
        onPress={onOpen}
        startContent={
          isCreateForm ? (
            <FontAwesomeIcon icon={faAdd} />
          ) : (
            <FontAwesomeIcon icon={faEdit} />
          )
        }
      >
        {isCreateForm ? 'Add Vendor' : 'Edit Vendor'}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isCreateForm ? 'Create Vendor' : 'Edit Vendor'}
              </ModalHeader>
              <ModalBody className="gap-4">
                {mutation.isError ? (
                  <div className="text-red-500">
                    Error: {mutation.error?.title || 'Failed to create vendor'}
                  </div>
                ) : null}

                <Input
                  label="Name"
                  placeholder="Enter the product name..."
                  className="w-full"
                  value={vendor.name}
                  onChange={(e) =>
                    setVendor({ ...vendor, name: e.target.value })
                  }
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
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={
                    isCreateForm ? handleCreateVendor : handleUpdateVendor
                  }
                  isLoading={mutation.isPending}
                >
                  {isCreateForm ? 'Create' : 'Save'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
