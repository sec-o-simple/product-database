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

export default function AddProduct({ id }: { id?: string | number }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const isCreateForm = !id
  const label = isCreateForm ? 'Add Product' : 'Edit Product'

  return (
    <>
      <Button
        color="primary"
        onPress={onOpen}
        startContent={<FontAwesomeIcon icon={faAdd} />}
      >
        {label}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{label}</ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label="Name"
                  placeholder="Enter the product name..."
                  className="w-full"
                  type="text"
                />

                <Textarea
                  label="Description"
                  multiple
                  placeholder="Enter the description..."
                  className="w-full"
                  type="text"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  {isCreateForm ? 'Add Product' : 'Save Changes'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
