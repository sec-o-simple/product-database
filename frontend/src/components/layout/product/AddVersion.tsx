import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ButtonProps } from '@heroui/button'
import {
  Button,
  Checkbox,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SelectItem,
  useDisclosure,
} from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'

export default function AddVersion(props: { props?: ButtonProps }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button color="primary" onPress={onOpen} {...props}>
        <FontAwesomeIcon icon={faAdd} className="mr-2" />
        Add Version
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New Version
              </ModalHeader>
              <ModalBody className="gap-4">
                <Select label="Product" placeholder="Select a product">
                  <SelectItem key="1">Product 1</SelectItem>
                  <SelectItem key="2">Product 2</SelectItem>
                </Select>

                <Select label="Type" placeholder="Select a type">
                  <SelectItem key="1">Firmware</SelectItem>
                  <SelectItem key="2">Software</SelectItem>
                  <SelectItem key="3">Hardware</SelectItem>
                </Select>

                <div className="flex flex-row gap-2">
                  <Input
                    label="Version Number"
                    placeholder="1.0.0"
                    className="w-full"
                    type="text"
                  />

                  <I18nProvider locale="de-DE">
                    <DatePicker
                      label="Release Date"
                      variant="bordered"
                      labelPlacement="outside"
                      classNames={{
                        inputWrapper: 'border-1 shadow-none',
                        base: 'gap-1',
                      }}
                    />
                  </I18nProvider>
                </div>
                <Checkbox>Is Latest Version?</Checkbox>
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
