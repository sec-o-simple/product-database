import client from '@/client'
import { Input, Textarea } from '@/components/forms/Input'
import { useVendorQuery } from '@/routes/Vendor'
import { VendorProps } from '@/routes/Vendors'
import { useErrorLocalization } from '@/utils/useErrorLocalization'
import useRouter from '@/utils/useRouter'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

export function useVendorMutation({ vendor }: { vendor: VendorProps }) {
  const { navigate } = useRouter()

  const onSuccess = useCallback(
    (id: string) => {
      navigate(`/vendors/${id}`, {
        replace: true,
        state: {
          shouldRefetch: true,
        },
      })
    },
    [navigate],
  )

  const isCreateForm = !vendor.id

  const createMutation = client.useMutation('post', '/api/v1/vendors', {
    onSuccess: (res) => {
      onSuccess(res.id)
    },
  })
  const updateMutation = client.useMutation('put', '/api/v1/vendors/{id}', {
    onSuccess: (res) => {
      onSuccess(res.id)
    },
    params: { path: { id: vendor.id } },
  })

  const mutateVendor = useCallback(() => {
    const body = {
      name: vendor.name,
      description: vendor.description,
    }
    if (isCreateForm) {
      createMutation.mutate({ body })
    } else {
      updateMutation.mutate({
        body,
        params: { path: { id: vendor.id || '' } },
      })
    }
  }, [isCreateForm, createMutation, updateMutation, vendor])

  const mutation = isCreateForm ? createMutation : updateMutation

  return { mutateVendor, isPending: mutation.isPending, error: mutation.error }
}

export function CreateVendorButton() {
  const { navigateToModal } = useRouter()
  const { t } = useTranslation()

  return (
    <Button color="primary" onPress={() => navigateToModal('/vendors/create')}>
      <FontAwesomeIcon icon={faAdd} className="mr-2" />
      {t('common.createObject', { label: t('vendor.label') })}
    </Button>
  )
}

export default function CreateEditVendor() {
  const { navigate, location } = useRouter()
  const { vendorId } = useParams()
  const { t } = useTranslation()
  const isCreateForm = !vendorId

  const { data: previousData, isLoading } = useVendorQuery(vendorId || '')

  const [vendor, setVendor] = useState<VendorProps>({
    id: previousData?.id || '',
    name: previousData?.name || '',
    description: previousData?.description || '',
  })

  useEffect(() => {
    if (previousData) {
      setVendor({
        id: previousData.id,
        name: previousData.name,
        description: previousData.description,
      })
    }
  }, [previousData])

  const onClose = () => {
    setVendor({ name: '', description: '' })

    navigate(location.state.returnTo ?? '/vendors', {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }

  const { mutateVendor, isPending, error } = useVendorMutation({
    vendor,
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
      onOpenChange={onClose}
      size="lg"
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t(isCreateForm ? 'common.createObject' : 'common.editObject', {
            label: t('vendor.label'),
          })}
        </ModalHeader>
        <ModalBody className="gap-4">
          {error ? (
            <Alert color="danger" className="mb-4">
              {t('form.errors')}
            </Alert>
          ) : null}

          <Input
            label="Name"
            placeholder="Enter the product name..."
            className="w-full"
            value={vendor.name}
            onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
            autoFocus
            type="text"
            isInvalid={errorHelper.isFieldInvalid('Name')}
            errorMessage={errorHelper.getFieldErrorMessage('Name')}
          />

          <Textarea
            label="Description"
            multiple
            placeholder="Enter the description..."
            className="w-full"
            value={vendor.description}
            onChange={(e) =>
              setVendor({ ...vendor, description: e.target.value })
            }
            isInvalid={errorHelper.isFieldInvalid('Description')}
            errorMessage={errorHelper.getFieldErrorMessage('Description')}
            type="text"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="primary" onPress={mutateVendor} isLoading={isPending}>
            {isCreateForm ? t('common.create') : t('common.save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
