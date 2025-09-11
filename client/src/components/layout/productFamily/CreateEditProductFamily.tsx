import client from '@/client'
import { Input } from '@/components/forms/Input'
import {
  ProductFamily,
  ProductFamilyChains,
  useProductFamilyListQuery,
  useProductFamilyQuery,
} from '@/routes/ProductFamilies'
import { useErrorLocalization } from '@/utils/useErrorLocalization'
import useRouter from '@/utils/useRouter'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Alert,
  Autocomplete,
  AutocompleteItem,
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

export function useProductFamilyMutation({
  productFamily,
}: {
  productFamily: ProductFamily
}) {
  const { navigate } = useRouter()

  const onSuccess = useCallback(() => {
    navigate('/product-families', {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }, [navigate])

  const isCreateForm = !productFamily.id

  const createMutation = client.useMutation(
    'post',
    '/api/v1/product-families',
    {
      onSuccess: () => {
        onSuccess()
      },
    },
  )
  const updateMutation = client.useMutation(
    'put',
    '/api/v1/product-families/{id}',
    {
      onSuccess: () => {
        onSuccess()
      },
      params: { path: { id: productFamily.id } },
    },
  )

  const mutateProductFamily = useCallback(() => {
    const body = {
      name: productFamily.name,
      parent_id: productFamily.parent_id,
    }
    if (isCreateForm) {
      createMutation.mutate({ body })
    } else {
      updateMutation.mutate({
        body,
        params: { path: { id: productFamily.id || '' } },
      })
    }
  }, [isCreateForm, createMutation, updateMutation, productFamily])

  const mutation = isCreateForm ? createMutation : updateMutation

  return {
    mutateProductFamily,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}

export function CreateProductGroupButton() {
  const { navigateToModal } = useRouter()
  const { t } = useTranslation()

  return (
    <Button
      color="primary"
      onPress={() => navigateToModal('/product-families/create')}
    >
      <FontAwesomeIcon icon={faAdd} className="mr-2" />
      {t('common.createObject', { label: t('productFamily.label') })}
    </Button>
  )
}

export default function CreateEditProductFamily() {
  const { navigate } = useRouter()
  const { familyId } = useParams()
  const { t } = useTranslation()
  const isCreateForm = !familyId

  const { data: families } = useProductFamilyListQuery()
  const { data: previousData, isLoading } = useProductFamilyQuery(
    familyId || '',
  )
  const [family, setFamily] = useState<ProductFamily>({
    id: previousData?.id || '',
    name: previousData?.name || '',
    parent_id: previousData?.parent_id,
    path: previousData?.path || [],
  })

  useEffect(() => {
    if (previousData) {
      setFamily({
        id: previousData.id,
        name: previousData.name,
        parent_id: previousData.parent_id,
        path: previousData.path || [],
      })
    }
  }, [previousData])

  const onClose = () => {
    setFamily({ name: '', parent_id: undefined, id: '', path: [] })

    navigate('/product-families', {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }

  const { mutateProductFamily, isPending, error } = useProductFamilyMutation({
    productFamily: family,
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
            label: t('productFamily.label'),
          })}
        </ModalHeader>
        <ModalBody className="gap-4">
          {error ? (
            <Alert color="danger" className="mb-4">
              {t('form.errors')}
            </Alert>
          ) : null}

          <Input
            label={t('form.fields.name')}
            className="w-full"
            value={family.name}
            onChange={(e) => setFamily({ ...family, name: e.target.value })}
            autoFocus
            type="text"
            isInvalid={errorHelper.isFieldInvalid('Name')}
            errorMessage={errorHelper.getFieldErrorMessage('Name')}
          />

          <Autocomplete
            labelPlacement="outside"
            label={t('form.fields.parent')}
            selectedKey={family.parent_id || ''}
            variant="bordered"
            inputProps={{
              classNames: {
                inputWrapper: 'border-1 shadow-none',
              },
            }}
            onSelectionChange={(key) => {
              if (key === null) {
                setFamily({ ...family, parent_id: undefined })
                return
              }

              setFamily({
                ...family,
                parent_id: key === '' ? undefined : key?.toString(),
              })
            }}
          >
            {families
              .filter((item) => item.id !== family.id)
              .map((item) => (
                <AutocompleteItem
                  key={item.id.toString()}
                  textValue={item.name}
                >
                  <ProductFamilyChains item={item} />
                </AutocompleteItem>
              ))}
          </Autocomplete>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            color="primary"
            onPress={mutateProductFamily}
            isLoading={isPending}
          >
            {isCreateForm ? t('common.create') : t('common.save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
