import client from '@/client'
import { Input, Textarea } from '@/components/forms/Input'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export function CreateVendorButton() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Button
      color="primary"
      onPress={() =>
        navigate('/vendors/create', {
          state: {
            backgroundLocation: location,
          },
        })
      }
    >
      <FontAwesomeIcon icon={faAdd} className="mr-2" />
      Create Vendor
    </Button>
  )
}

export default function CreateEditVendor() {
  const navigate = useNavigate()
  const { vendorId } = useParams()
  const isCreateForm = !vendorId

  const { data: previousData } = client.useQuery(
    'get',
    '/api/v1/vendors/{id}',
    {
      params: {
        path: {
          id: vendorId || '',
        },
      },
    },
  )

  const [vendor, setVendor] = useState<any>({
    name: previousData?.name || '',
    description: previousData?.description || '',
  })

  const mutation = isCreateForm
    ? client.useMutation('post', '/api/v1/vendors', {
        onSuccess: () => {
          setVendor({ name: '', description: '' })
          onClose()
        },
      })
    : client.useMutation('put', '/api/v1/vendors/{id}', {
        params: {
          path: {
            id: vendor?.id || '',
          },
        },
        onSuccess: () => {
          setVendor({ name: '', description: '' })
          onClose()
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

  const onClose = () => {
    navigate(`/vendors/${vendorId || ''}`, {
      replace: true,
    })
  }

  return (
    <Modal
      isOpen
      onOpenChange={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
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
          <Button
            color="primary"
            onPress={isCreateForm ? handleCreateVendor : handleUpdateVendor}
            isLoading={mutation.isPending}
          >
            {isCreateForm ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
