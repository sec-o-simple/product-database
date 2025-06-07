import client from '@/client'
import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'
import {
  Checkbox,
  DatePicker,
  DateValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SelectItem,
  useDisclosure,
} from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface AddVersionProps {
  props?: ButtonProps
  productBranchId: string
}

export default function AddVersion(props: AddVersionProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [releaseDate, setReleaseDate] = useState<DateValue | null>(null)
  const [isLatest, setIsLatest] = useState(false)

  const mutation = client.useMutation(
    "post",
    "/api/v1/products/{id}/versions",
    {
      onSuccess: () => {
        setName('')
        onClose()

        // Reload the current route
        navigate(0)
      },
    }
  )

  function handleCreateVersion() {
    mutation.mutate({
      body: {
        version: name,
        is_latest: isLatest,
        release_date: new Date().toISOString().split('T')[0],
        product_branch_id: props.productBranchId,
      },
      params: {
        path: {
          id: props.productBranchId,
        }
      }
    })
  }

  return (
    <>
      <Button
        color="primary"
        onPress={onOpen}
        startContent={<FontAwesomeIcon icon={faAdd} />}
        {...props}
      >
        Add Version
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl" isDismissable={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New Version
              </ModalHeader>
              <ModalBody className="gap-4">
                {mutation.error && (
                  <div className="text-red-500">
                    {mutation.error.title || 'An error occurred while creating the product.'}
                  </div>
                )}

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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                  />

                  <I18nProvider locale="de-DE">
                    <DatePicker
                      label="Release Date"
                      value={releaseDate}
                      onChange={(date) => setReleaseDate(date)}
                      variant="bordered"
                      labelPlacement="outside"
                      classNames={{
                        inputWrapper: 'border-1 shadow-none',
                        base: 'gap-1',
                      }}
                    />
                  </I18nProvider>
                </div>
                <Checkbox
                  isSelected={isLatest}
                  onChange={(e) => setIsLatest(e.target.checked)}
                >Is Latest Version?</Checkbox>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleCreateVersion} isLoading={mutation.isPending}>
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
