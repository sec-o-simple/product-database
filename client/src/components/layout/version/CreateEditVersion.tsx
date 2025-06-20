import client from '@/client'
import { Input } from '@/components/forms/Input'
import { getVersions } from '@/routes/Product'
import useRouter from '@/utils/useRouter'
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
import { useCallback, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

interface CreateEditVersionProps {
  productId?: string
}

export type VersionProps = {
  id?: string
  name: string
  releaseDate?: DateValue | null
}

export function useVersionMutation({
  productId,
  version,
  onClose,
  client,
}: {
  productId?: string
  version: VersionProps
  onClose: () => void
  client: any
}) {
  const onSuccess = useCallback(() => {
    onClose()
  }, [onClose])

  const mutation = version.id
    ? client.useMutation('put', '/api/v1/product-versions/{id}', { onSuccess })
    : client.useMutation('post', '/api/v1/product-versions', {
        onSuccess,
      })

  const mutateVersion = useCallback(() => {
    const body = {
      product_id: productId || '',
      version: version.name,
      release_date: version.releaseDate?.toString() ?? undefined,
    }

    mutation.mutate(
      version.id ? { body, params: { path: { id: version.id } } } : { body },
    )
  }, [mutation, productId, version])
  return { mutateVersion, isPending: mutation.isPending, error: mutation.error }
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
  const { navigate } = useRouter()
  const { productId, versionId } = useParams()

  const { data: previousData } = getVersions(versionId, productId) as {
    data: VersionProps
  }

  const [version, setVersion] = useState<VersionProps>({
    name: previousData?.name || '',
    releaseDate: previousData?.releaseDate
      ? parseDate(previousData.releaseDate.toString())
      : null,
  })

  const onClose = (shouldRefetch?: boolean) => {
    setVersion({ name: '', releaseDate: null })

    navigate(`/products/${productId}`, {
      replace: true,
      state: { shouldRefetch: shouldRefetch ?? true },
    })
  }

  const { mutateVersion, isPending, error } = useVersionMutation({
    productId,
    version: {
      id: previousData?.id || versionId,
      name: version.name,
      releaseDate: version.releaseDate,
    },
    onClose: onClose,
    client,
  })

  return (
    <Modal isOpen onOpenChange={onClose} size="xl" isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {versionId ? 'Edit Version' : 'Create Version'}
        </ModalHeader>
        <ModalBody className="gap-4">
          {error && (
            <div className="text-red-500">
              {error.title || 'An error occurred while creating the product.'}
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
          <Button variant="light" onPress={() => onClose(false)}>
            Cancel
          </Button>
          <Button color="primary" onPress={mutateVersion} isLoading={isPending}>
            {versionId ? 'Save' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
