import client from '@/client'
import { Input } from '@/components/forms/Input'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import type { DateValue } from '@internationalized/date'
import { parseDate } from '@internationalized/date'
import { I18nProvider } from '@react-aria/i18n'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

interface CreateEditVersionProps {
  productId?: string
}

export function AddVersionButton({ productId }: CreateEditVersionProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Button
      color="primary"
      startContent={<FontAwesomeIcon icon={faAdd} />}
      onPress={() => {
        navigate(`/products/${productId}/versions/create`, {
          state: {
            backgroundLocation: location,
          },
        })
      }}
    >
      Add Version
    </Button>
  )
}

export default function CreateEditVersion() {
  const { productId, versionId } = useParams<{
    productId: string
    versionId?: string
  }>()
  const navigate = useNavigate()
  const isCreateForm = !versionId

  const { data: previousData } = client.useQuery(
    'get',
    `/api/v1/product-versions/{id}`,
    {
      params: {
        path: {
          id: versionId || '',
        },
      },
    },
  )

  const [version, setVersion] = useState<{
    name: string
    releaseDate: DateValue | null | undefined
  }>({
    name: previousData?.name || '',
    releaseDate: previousData?.release_date
      ? parseDate(previousData.release_date)
      : null,
  })

  const mutation = isCreateForm
    ? client.useMutation('post', '/api/v1/product-versions', {
        onSuccess: () => {
          onClose()
        },
      })
    : client.useMutation('post', '/api/v1/product-versions', {
        onSuccess: () => {
          onClose()
        },
      })

  function handleCreateVersion() {
    mutation.mutate({
      body: {
        product_id: productId || '',
        version: version.name,
        // ToDo
        release_date: version.releaseDate?.toString() ?? undefined,
      },
    })
  }

  function handleUpdateVersion() {
    mutation.mutate({
      body: {
        product_id: productId || '',
        version: version.name,
        // ToDo
        release_date: version.releaseDate?.toString() ?? undefined,
      },
    })
  }

  const onClose = () => navigate(-1)

  return (
    <Modal isOpen onOpenChange={onClose} size="xl" isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Add New Version
        </ModalHeader>
        <ModalBody className="gap-4">
          {mutation.error && (
            <div className="text-red-500">
              {mutation.error.title ||
                'An error occurred while creating the product.'}
            </div>
          )}

          <div className="flex flex-row gap-2">
            <Input
              label="Version Number"
              placeholder="1.0.0"
              className="w-full"
              value={version.name}
              onChange={(e) => setVersion({ ...version, name: e.target.value })}
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
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={isCreateForm ? handleCreateVersion : handleUpdateVersion}
            isLoading={mutation.isPending}
          >
            {isCreateForm ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
