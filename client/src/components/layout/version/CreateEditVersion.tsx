import client from '@/client'
import { Input } from '@/components/forms/Input'
import { useVersionQuery } from '@/routes/Version'
import { useErrorLocalization } from '@/utils/useErrorLocalization'
import useRouter from '@/utils/useRouter'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Alert,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  type DateValue,
} from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { I18nProvider } from '@react-aria/i18n'
import { useCallback, useEffect, useState } from 'react'

// Type alias to resolve DateValue conflict between packages
type HeroUIDateValue = React.ComponentProps<typeof DatePicker>['value']

import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

interface CreateEditVersionProps {
  productId: string
  returnTo?: string
}

export type VersionProps = {
  id?: string
  name: string
  releaseDate?: DateValue | null | undefined
}

export function useVersionMutation({
  productId,
  version,
}: {
  productId?: string
  version: VersionProps
}) {
  const { navigate } = useRouter()

  const onSuccess = useCallback(
    (id: string) => {
      navigate(`/product-versions/${id}`, {
        replace: true,
        state: {
          shouldRefetch: true,
        },
      })
    },
    [navigate],
  )

  const isCreateForm = !version.id

  const createMutation = client.useMutation(
    'post',
    '/api/v1/product-versions',
    {
      onSuccess: (res) => {
        onSuccess(res.id)
      },
    },
  )
  const updateMutation = client.useMutation(
    'put',
    '/api/v1/product-versions/{id}',
    {
      params: { path: { id: version.id } },
      onSuccess: (res) => {
        onSuccess(res.id)
      },
    },
  )

  const mutateVersion = useCallback(() => {
    const body = {
      product_id: productId || '',
      version: version.name,
      release_date: version.releaseDate?.toString(),
    }

    if (isCreateForm) {
      createMutation.mutate({ body })
    } else {
      updateMutation.mutate({
        body,
        params: { path: { id: version.id || '' } },
      })
    }
  }, [productId, version, createMutation, isCreateForm, updateMutation])

  const mutation = isCreateForm ? createMutation : updateMutation

  return { mutateVersion, isPending: mutation.isPending, error: mutation.error }
}

export function AddVersionButton({
  productId,
  returnTo,
}: CreateEditVersionProps) {
  const { navigateToModal } = useRouter()
  const { t } = useTranslation()

  return (
    <Button
      color="primary"
      startContent={<FontAwesomeIcon icon={faAdd} />}
      onPress={() => {
        navigateToModal(`/products/${productId}/versions/create`, returnTo)
      }}
    >
      {t('common.createObject', {
        label: t('version.label'),
      })}
    </Button>
  )
}

function VersionSkeleton() {
  return (
    <div className="flex w-full animate-pulse gap-2">
      <div className="flex-1">
        <div className="mb-1 h-5 w-24 rounded bg-gray-200" />
        <div className="h-10 rounded bg-gray-200" />
      </div>
      <div className="flex-1">
        <div className="mb-1 h-5 w-24 rounded bg-gray-200" />
        <div className="h-10 rounded bg-gray-200" />
      </div>
    </div>
  )
}

export default function CreateEditVersion() {
  const { navigate, location } = useRouter()
  const { productId, versionId } = useParams()
  const { t } = useTranslation()

  const isCreateForm = !versionId

  const { data: previousData, isLoading } = useVersionQuery(versionId)

  const [version, setVersion] = useState<VersionProps>({
    name: '',
    releaseDate: null,
  })

  useEffect(() => {
    if (previousData) {
      setVersion({
        id: previousData.id,
        name: previousData.name,
        releaseDate: previousData.released_at
          ? parseDate(previousData.released_at.toString())
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
    productId: isCreateForm ? productId : previousData?.product_id,
    version: {
      id: previousData?.id || versionId,
      name: version.name,
      releaseDate: version.releaseDate,
    },
  })

  const errorHelper = useErrorLocalization(error)

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
    <Modal
      isOpen
      onOpenChange={() => onClose()}
      size="xl"
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t(versionId ? 'common.editObject' : 'common.createObject', {
            label: t('version.label'),
          })}
        </ModalHeader>
        <ModalBody className="gap-4">
          {error ? (
            <Alert color="danger" className="mb-4">
              {t('form.errors')}
            </Alert>
          ) : null}

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
                isInvalid={errorHelper.isFieldInvalid('Version')}
                errorMessage={errorHelper.getFieldErrorMessage('Version')}
              />

              <I18nProvider locale="de-DE">
                <DatePicker
                  label="Release Date"
                  variant="bordered"
                  value={version.releaseDate as HeroUIDateValue}
                  onChange={(date) =>
                    setVersion({ ...version, releaseDate: date })
                  }
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
            {t('common.cancel')}
          </Button>
          <Button color="primary" onPress={mutateVersion} isLoading={isPending}>
            {versionId ? t('common.save') : t('common.create')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
