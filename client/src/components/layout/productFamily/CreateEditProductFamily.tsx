import client from '@/client'
import { Input } from '@/components/forms/Input'
import {
  ProductFamilyChains,
  ProductFamilyProps,
  RawProductFamily,
  useProductFamilyListQuery,
  useProductFamilyQuery,
} from '@/routes/ProductFamilies'
import { VendorProps } from '@/routes/Vendors'
import useRouter from '@/utils/useRouter'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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

  const { data: families } = useProductFamilyListQuery(true) as unknown as {
    data: ProductFamilyProps[]
  }
  const { data: previousData } = useProductFamilyQuery(familyId || '')
  const [family, setFamily] = useState<RawProductFamily>({
    id: previousData?.id || '',
    name: previousData?.name || '',
    parent: previousData?.parent || null,
  })

  useEffect(() => {
    if (previousData) {
      setFamily({
        id: previousData.id,
        name: previousData.name,
        parent: previousData.parent || null,
      })
    }
  }, [previousData])

  const onClose = () => {
    setFamily({ name: '', parent: null, id: '' })

    navigate('/product-families', {
      replace: true,
      state: {
        shouldRefetch: true,
      },
    })
  }

  // const errorHelper = useErrorLocalization(error)

  // if (!isCreateForm && isLoading) {
  //   return (
  //     <Modal isOpen>
  //       <ModalBody>
  //         <Spinner />
  //       </ModalBody>
  //     </Modal>
  //   )
  // }

  console.log('families', family, families)

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
          {/* {error ? (
            <Alert color="danger" className="mb-4">
              {t('form.errors')}
            </Alert>
          ) : null} */}

          <Input
            label={t('form.fields.name')}
            className="w-full"
            value={family.name}
            onChange={(e) => setFamily({ ...family, name: e.target.value })}
            autoFocus
            type="text"
            // isInvalid={errorHelper.isFieldInvalid('Name')}
            // errorMessage={errorHelper.getFieldErrorMessage('Name')}
          />

          <Autocomplete
            labelPlacement="outside"
            label={t('form.fields.parent')}
            selectedKey={family.parent || ''}
            variant="bordered"
            inputProps={{
              classNames: {
                inputWrapper: 'border-1 shadow-none',
              },
            }}
            inputValue={
              families.find((item) => item.id === family.parent)?.name || ''
            }
          >
            {families
              .filter((item) => item.id !== family.id)
              .map((item) => (
                <AutocompleteItem key={item.id}>
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
            // onPress={mutateVendor} isLoading={isPending}
          >
            {isCreateForm ? t('common.create') : t('common.save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
