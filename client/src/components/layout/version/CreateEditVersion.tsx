import client from '@/client'
import { Input } from '@/components/forms/Input'
import { useVersionQuery } from '@/routes/Version'
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
  Spinner,
} from '@heroui/react'
import { parseDate, type DateValue } from '@internationalized/date'
import { I18nProvider } from '@react-aria/i18n'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProductProps } from '../product/CreateEditProduct'

interface CreateEditVersionProps {
  product?: ProductProps
  returnTo?: string
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

  const isCreateForm = !version.id

  const createMutation = client.useMutation(
    'post',
    '/api/v1/product-versions',
    {
      onSuccess,
    },
  )
  const updateMutation = client.useMutation(
    'put',
    '/api/v1/product-versions/{id}',
    {
      params: { path: { id: version.id } },
      onSuccess,
    },
  )

  const mutateVersion = useCallback(() => {
    const body = {
      product_id: productId || '',
      version: version.name,
      release_date: version.releaseDate?.toString() ?? undefined,
    }

    if (isCreateForm) {
      createMutation.mutate({ body })
    } else {
      updateMutation.mutate({ body, params: { path: { id: version.id } } })
    }
  }, [productId, version])

  const mutation = isCreateForm ? createMutation : updateMutation

  return { mutateVersion, isPending: mutation.isPending, error: mutation.error }
}

export function AddVersionButton({
  product,
  returnTo,
}: CreateEditVersionProps) {
  const { navigateToModal } = useRouter()

  return (
    <Button
      color="primary"
      startContent={<FontAwesomeIcon icon={faAdd} />}
      onPress={() => {
        navigateToModal(
          `/vendors/${product?.vendor_id}/products/${product?.id}/versions/create`,
          returnTo,
        )
      }}
    >
      Add Version
    </Button>
  )
}

function VersionSkeleton() {
  return (
    <div className="flex flex- gap-2 w-full animate-pulse">
      <div className="flex-1">
        <div className="h-5 w-24 bg-gray-200 rounded mb-1" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
      <div className="flex-1">
        <div className="h-5 w-24 bg-gray-200 rounded mb-1" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export default function CreateEditVersion() {
  const { navigate, location } = useRouter()
  const { productId, versionId } = useParams()

  const isCreateForm = !versionId

  const { data: previousData, isLoading } = useVersionQuery(versionId || '')

  const [version, setVersion] = useState<VersionProps>({
    name: '',
    releaseDate: null,
  })

  useEffect(() => {
    if (previousData) {
      setVersion({
        id: previousData.id,
        name: previousData.name,
        releaseDate: previousData.release_date
          ? parseDate(previousData.releaseDate.toString())
          : null,
      })
    }
  }, [previousData])

  const onClose = (shouldRefetch?: boolean) => {
    setVersion({ name: '', releaseDate: null })

    navigate(location.state.returnTo ?? `/products/${productId}`, {
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

  if (!isCreateForm && isLoading) {
    return (
      <Modal isOpen>
        <ModalBody>
          <Spinner />
        </ModalBody>
      </Modal>
    )
  }

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

          {isLoading ? (
            <VersionSkeleton />
          ) : (
            <div className="flex flex-row gap-2">
              <Input
                label="Version Number"
                placeholder="1.0.0"
                className="w-full"
                value={version.name}
                onChange={(e) =>
                  setVersion({ ...version, name: e.target.value })
                }
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
          )}
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
