import { Button, ButtonProps } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'
import { useTranslation } from 'react-i18next'

type ConfirmButtonProps = {
  confirmText: string
  confirmTitle: string
  onConfirm: () => void
} & ButtonProps

export default function ConfirmButton({
  confirmText,
  confirmTitle,
  onConfirm,
  ...props
}: ConfirmButtonProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button onPress={onOpen} fullWidth {...props}>
        {props?.children || 'Confirm'}
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
                  {t('common.cancel')}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onConfirm()
                    onClose()
                  }}
                >
                  {t('common.confirm')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
