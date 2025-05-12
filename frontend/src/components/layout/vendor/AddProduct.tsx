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

export default function AddProduct() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        <FontAwesomeIcon icon={faAdd} className="mr-2" />
        Add Product
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Product
              </ModalHeader>
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
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
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
