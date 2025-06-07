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
  useDisclosure,
} from '@heroui/react'
import { useState } from 'react'

interface AddVendorProps {
  onCreate?: () => void
}

export default function AddVendor({ onCreate }: AddVendorProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const mutation = client.useMutation(
    "post",
    "/api/v1/vendors",
    {
      onSuccess: () => {
        setName('')
        setDescription('')
        onClose()
        onCreate?.()
      },
    }
  )

  function handleCreateVendor() {
    mutation.mutate({
      body: {
        name,
        description,
      },
    })
  }

  return (
    <>
      <Button
        color="primary"
        onPress={onOpen}
        startContent={<FontAwesomeIcon icon={faAdd} />}
      >
        Add Vendor
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Vendor
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  type="text"
                />

                <Textarea
                  label="Description"
                  multiple
                  placeholder="Enter the description..."
                  className="w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  type="text"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleCreateVendor} isLoading={mutation.isPending}>
                  Create Vendor
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
