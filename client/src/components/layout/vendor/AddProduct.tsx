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
import { useNavigate } from 'react-router-dom'

interface AddProductProps {
  vendorBranchId: string,
}

export default function AddProduct({ vendorBranchId }: AddProductProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const mutation = client.useMutation(
    "post",
    "/api/v1/products",
    {
      onSuccess: () => {
        setName('')
        setDescription('')
        onClose()

        // Reload the current route
        navigate(0)
      },
    }
  )

  function handleCreateProduct() {
    mutation.mutate({
      body: {
        name,
        description,
        vendor_branch_id: vendorBranchId,
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
        Add Product
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Product
              </ModalHeader>
              <ModalBody className="gap-4">
                {mutation.error && (
                  <div className="text-red-500">
                    {mutation.error.title || 'An error occurred while creating the product.'}
                  </div>
                )}
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
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleCreateProduct} isLoading={mutation.isPending}>
                  Create Product
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
