import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'

export default function ConfirmButton({
  buttonProps,
  confirmTitle,
  confirmText,
}: {
  buttonProps?: React.ComponentProps<typeof Button> & {
    label?: string
  }
  confirmTitle: string
  confirmText: string
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button onPress={onOpen} fullWidth {...buttonProps}>
        {buttonProps?.label || 'Confirm'}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {confirmTitle || 'Confirm'}
              </ModalHeader>
              <ModalBody className="gap-4">
                <p>{confirmText}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
