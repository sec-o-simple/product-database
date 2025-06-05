import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'
import {
  Checkbox,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react'
import { HelperTypeProps, idHelperTypes } from '../Version'

export function AddIdHelperItem(props?: ButtonProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button
        color="primary"
        onPress={onOpen}
        startContent={<FontAwesomeIcon icon={faAdd} />}
        {...props}
      >
        Add New Item
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New Item
              </ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label="Filename"
                  placeholder="document.pdf"
                  className="w-full"
                  type="text"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
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
