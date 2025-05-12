import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { faAdd, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SelectItem,
  useDisclosure,
} from '@heroui/react'

export default function AddRelationship() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        <FontAwesomeIcon icon={faAdd} className="mr-2" />
        Add Relationship
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create Product Relationship
              </ModalHeader>
              <ModalBody className="gap-4">
                <div className="flex flex-row gap-2">
                  <Select label="Source Product" className="w-2/3">
                    <SelectItem key="1">Product 1</SelectItem>
                    <SelectItem key="2">Product 2</SelectItem>
                  </Select>

                  <Select label="Version" className="w-1/3">
                    <SelectItem key="1">Firmware</SelectItem>
                    <SelectItem key="2">Software</SelectItem>
                    <SelectItem key="3">Hardware</SelectItem>
                  </Select>
                </div>

                <div className="flex flex-row gap-2">
                  <Select label="Target Product" className="w-2/3">
                    <SelectItem key="1">Product 1</SelectItem>
                    <SelectItem key="2">Product 2</SelectItem>
                  </Select>

                  <Select label="Version" className="w-1/3">
                    <SelectItem key="1">Firmware</SelectItem>
                    <SelectItem key="2">Software</SelectItem>
                    <SelectItem key="3">Hardware</SelectItem>
                  </Select>
                </div>

                <Select label="Relationship Type" placeholder="Select a type">
                  <SelectItem key="1">Firmware</SelectItem>
                  <SelectItem key="2">Software</SelectItem>
                </Select>

                <Input
                  label="Description"
                  placeholder="Enter the description..."
                  className="w-full"
                  type="text"
                />

                <div className="flex flex-row gap-2 bg-gray-100 items-center rounded-md p-4 justify-between">
                  <div className="border border-gray items-center bg-white rounded-lg p-2 px-4 flex flex-col">
                    <p>Source Product</p>
                    <p className="text-sm text-gray-50">Version: 1.2.1</p>
                  </div>

                  <FontAwesomeIcon
                    icon={faArrowRight}
                    size="xl"
                    className="text-primary"
                  />

                  <div className="border border-gray items-center bg-white rounded-lg p-2 px-4 flex flex-col">
                    <p>Target Product</p>
                    <p className="text-sm text-gray-50">Version: 2.5.1</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
