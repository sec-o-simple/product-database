import client from '@/client'
import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import useRefetchQuery from '@/utils/useRefetchQuery'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal'
import { Button } from '@heroui/react'
import { SelectItem } from '@heroui/select'
import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { HelperTypeProps, idHelperTypes } from './IdentificationOverview'

export interface CPEData {
  cpe: string
}

export interface HashData {
  file_hashes: Array<{
    filename: string
    items: Array<{
      algorithm: string
      value: string
    }>
  }>
}

export interface ModelData {
  models: string[]
}

export interface PURLData {
  purl: string
}

export interface SBOMData {
  sbom_urls: string[]
}

export interface SerialData {
  serial_numbers: string[]
}

export interface SKUData {
  skus: string[]
}

export interface URIData {
  uris: Array<{
    namespace: string
    uri: string
  }>
}

export type HelperData =
  | CPEData
  | HashData
  | ModelData
  | PURLData
  | SBOMData
  | SerialData
  | SKUData
  | URIData

interface CreateIDHelperProps {
  availableTypes?: HelperTypeProps[]
  editData: {
    type: HelperTypeProps
    helperId: string // The API ID for updates
  }
  onClose?: () => void
}

// Component for CPE input
function CPEComponent({
  data,
  onChange,
}: {
  data: CPEData
  onChange: (data: CPEData) => void
}) {
  const { t } = useTranslation()

  return (
    <Input
      type="text"
      label={t('identificationHelper.fields.cpeString')}
      placeholder="cpe:2.3:a:vendor:product:version:*:*:*:*:*:*:*"
      labelPlacement="outside"
      classNames={{ inputWrapper: 'bg-white' }}
      value={data.cpe}
      onChange={(e) => onChange({ cpe: e.target.value })}
      isRequired
    />
  )
}

// Component for Hash input
function HashComponent({
  data,
  onChange,
}: {
  data: HashData
  onChange: (data: HashData) => void
}) {
  const { t } = useTranslation()

  const addFileHash = () => {
    onChange({
      file_hashes: [
        ...data.file_hashes,
        {
          filename: '',
          items: [{ algorithm: '', value: '' }],
        },
      ],
    })
  }

  const updateFileHash = (index: number, filename: string) => {
    const updated = [...data.file_hashes]
    updated[index] = { ...updated[index], filename }
    onChange({ file_hashes: updated })
  }

  const addHashItem = (fileIndex: number) => {
    const updated = [...data.file_hashes]
    updated[fileIndex].items.push({ algorithm: '', value: '' })
    onChange({ file_hashes: updated })
  }

  const updateHashItem = (
    fileIndex: number,
    itemIndex: number,
    field: 'algorithm' | 'value',
    value: string,
  ) => {
    const updated = [...data.file_hashes]
    updated[fileIndex].items[itemIndex][field] = value
    onChange({ file_hashes: updated })
  }

  const removeFileHash = (index: number) => {
    onChange({
      file_hashes: data.file_hashes.filter((_, i) => i !== index),
    })
  }

  const removeHashItem = (fileIndex: number, itemIndex: number) => {
    const updated = [...data.file_hashes]
    updated[fileIndex].items = updated[fileIndex].items.filter(
      (_, i) => i !== itemIndex,
    )
    onChange({ file_hashes: updated })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {t('identificationHelper.types.hashes.label')}
        </label>
        <Button size="sm" variant="bordered" onPress={addFileHash}>
          {t('identificationHelper.addFile')}
        </Button>
      </div>

      {data.file_hashes.map((fileHash, fileIndex) => (
        <div key={fileIndex} className="rounded-md border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Input
              type="text"
              label={t('identificationHelper.filename')}
              placeholder="example.tar.gz"
              labelPlacement="outside"
              classNames={{ inputWrapper: 'bg-white' }}
              value={fileHash.filename}
              onChange={(e) => updateFileHash(fileIndex, e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              color="danger"
              variant="light"
              isIconOnly
              onPress={() => removeFileHash(fileIndex)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('identificationHelper.hashValues')}
              </span>
              <Button
                size="sm"
                variant="light"
                onPress={() => addHashItem(fileIndex)}
              >
                {t('identificationHelper.addHash')}
              </Button>
            </div>

            {fileHash.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-end gap-2">
                <Input
                  type="text"
                  label={t('identificationHelper.algorithm')}
                  placeholder="sha256"
                  labelPlacement="outside"
                  classNames={{ inputWrapper: 'bg-white' }}
                  value={item.algorithm}
                  onChange={(e) =>
                    updateHashItem(
                      fileIndex,
                      itemIndex,
                      'algorithm',
                      e.target.value,
                    )
                  }
                  className="flex-1"
                />
                <Input
                  type="text"
                  label={t('identificationHelper.hashValue')}
                  placeholder="abc123..."
                  labelPlacement="outside"
                  classNames={{ inputWrapper: 'bg-white' }}
                  value={item.value}
                  onChange={(e) =>
                    updateHashItem(
                      fileIndex,
                      itemIndex,
                      'value',
                      e.target.value,
                    )
                  }
                  className="flex-1"
                />
                {fileHash.items.length > 1 && (
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    isIconOnly
                    onPress={() => removeHashItem(fileIndex, itemIndex)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {data.file_hashes.length === 0 && (
        <div className="py-4 text-center text-zinc-500">
          {t('identificationHelper.noDataYet', {
            type: t('identificationHelper.types.hashes.label').toLowerCase(),
            buttonText: t('identificationHelper.addFile'),
          })}
        </div>
      )}
    </div>
  )
}

// Component for simple string arrays (Models, SBOM URLs, Serial Numbers, SKUs)
function StringArrayComponent({
  data,
  onChange,
  label,
  placeholder,
}: {
  data: string[]
  onChange: (data: string[]) => void
  label: string
  placeholder: string
}) {
  const { t } = useTranslation()

  const addItem = () => {
    onChange([...data, ''])
  }

  const updateItem = (index: number, value: string) => {
    const updated = [...data]
    updated[index] = value
    onChange(updated)
  }

  const removeItem = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button size="sm" variant="bordered" onPress={addItem}>
          {t('common.addObject', { label: label.slice(0, -1) })}
        </Button>
      </div>

      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={placeholder}
            classNames={{ inputWrapper: 'bg-white' }}
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            className="flex-1"
          />
          {data.length > 1 && (
            <Button
              size="sm"
              color="danger"
              variant="light"
              isIconOnly
              onPress={() => removeItem(index)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      ))}

      {data.length === 0 && (
        <div className="py-4 text-center text-zinc-500">
          {t('identificationHelper.noDataYet', {
            type: label.toLowerCase(),
            buttonText: t('common.addObject', { label: label.slice(0, -1) }),
          })}
        </div>
      )}
    </div>
  )
}

// Component for URI pairs
function URIComponent({
  data,
  onChange,
}: {
  data: URIData
  onChange: (data: URIData) => void
}) {
  const { t } = useTranslation()

  const addURI = () => {
    onChange({
      uris: [...data.uris, { namespace: '', uri: '' }],
    })
  }

  const updateURI = (
    index: number,
    field: 'namespace' | 'uri',
    value: string,
  ) => {
    const updated = [...data.uris]
    updated[index][field] = value
    onChange({ uris: updated })
  }

  const removeURI = (index: number) => {
    onChange({
      uris: data.uris.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {t('identificationHelper.types.uri.label')}
        </label>
        <Button size="sm" variant="bordered" onPress={addURI}>
          {t('identificationHelper.addURI')}
        </Button>
      </div>

      {data.uris.map((uri, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="namespace"
            label={t('identificationHelper.namespace')}
            labelPlacement="outside"
            classNames={{ inputWrapper: 'bg-white' }}
            value={uri.namespace}
            onChange={(e) => updateURI(index, 'namespace', e.target.value)}
            className="flex-1"
          />
          <Input
            type="text"
            placeholder="https://example.com/resource"
            label="URI"
            labelPlacement="outside"
            classNames={{ inputWrapper: 'bg-white' }}
            value={uri.uri}
            onChange={(e) => updateURI(index, 'uri', e.target.value)}
            className="flex-1"
          />
          {data.uris.length > 1 && (
            <Button
              size="sm"
              color="danger"
              variant="light"
              isIconOnly
              onPress={() => removeURI(index)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      ))}

      {data.uris.length === 0 && (
        <div className="py-4 text-center text-zinc-500">
          {t('identificationHelper.noDataYet', {
            type: t('identificationHelper.types.uri.label').toLowerCase(),
            buttonText: t('identificationHelper.addURI'),
          })}
        </div>
      )}
    </div>
  )
}

function getInitialData(component: HelperTypeProps['component']): HelperData {
  switch (component) {
    case 'cpe':
      return { cpe: '' }
    case 'hashes':
      return {
        file_hashes: [{ filename: '', items: [{ algorithm: '', value: '' }] }],
      }
    case 'models':
      return { models: [''] }
    case 'purl':
      return { purl: '' }
    case 'sbom':
      return { sbom_urls: [''] }
    case 'serial':
      return { serial_numbers: [''] }
    case 'sku':
      return { skus: [''] }
    case 'uri':
      return { uris: [{ namespace: '', uri: '' }] }
    default:
      return { cpe: '' }
  }
}

function DynamicHelperComponent({
  type,
  data,
  onChange,
}: {
  type: HelperTypeProps
  data: HelperData
  onChange: (data: HelperData) => void
}) {
  const { t } = useTranslation()

  switch (type.component) {
    case 'cpe':
      return (
        <CPEComponent
          data={data as CPEData}
          onChange={onChange as (data: CPEData) => void}
        />
      )
    case 'hashes':
      return (
        <HashComponent
          data={data as HashData}
          onChange={onChange as (data: HashData) => void}
        />
      )
    case 'models':
      return (
        <StringArrayComponent
          data={(data as ModelData).models}
          onChange={(models) => onChange({ models })}
          label={t('identificationHelper.fields.models')}
          placeholder="Model-XYZ-123"
        />
      )
    case 'purl':
      return (
        <Input
          type="text"
          label={t('identificationHelper.fields.purlString')}
          placeholder="pkg:npm/package@1.0.0"
          labelPlacement="outside"
          classNames={{ inputWrapper: 'bg-white' }}
          value={(data as PURLData).purl}
          onChange={(e) => onChange({ purl: e.target.value })}
          isRequired
        />
      )
    case 'sbom':
      return (
        <StringArrayComponent
          data={(data as SBOMData).sbom_urls}
          onChange={(sbom_urls) => onChange({ sbom_urls })}
          label={t('identificationHelper.fields.sbomUrls')}
          placeholder="https://example.com/sbom.json"
        />
      )
    case 'serial':
      return (
        <StringArrayComponent
          data={(data as SerialData).serial_numbers}
          onChange={(serial_numbers) => onChange({ serial_numbers })}
          label={t('identificationHelper.fields.serialNumbers')}
          placeholder="SN123456789"
        />
      )
    case 'sku':
      return (
        <StringArrayComponent
          data={(data as SKUData).skus}
          onChange={(skus) => onChange({ skus })}
          label={t('identificationHelper.fields.skus')}
          placeholder="SKU-ABC-123"
        />
      )
    case 'uri':
      return (
        <URIComponent
          data={data as URIData}
          onChange={onChange as (data: URIData) => void}
        />
      )
    default:
      return <div>Unknown component type</div>
  }
}

export default function CreateEditIDHelper({
  availableTypes,
  editData,
  onClose,
}: CreateIDHelperProps) {
  const { t } = useTranslation()
  const { versionId } = useParams()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [selectedType, setSelectedType] = useState<HelperTypeProps | null>(null)
  const [helperData, setHelperData] = useState<HelperData | null>(null)

  const typesToShow = availableTypes || idHelperTypes

  // Fetch identification helpers to enable refetch
  const identificationHelpersRequest = client.useQuery(
    'get',
    '/api/v1/product-versions/{id}/identification-helpers',
    {
      params: { path: { id: versionId || '' } },
    },
    {
      enabled: !!versionId,
    },
  )
  useRefetchQuery(identificationHelpersRequest)

  // Fetch individual helper data when editing
  const helperDataRequest = client.useQuery(
    'get',
    '/api/v1/identification-helper/{id}',
    {
      params: { path: { id: editData?.helperId || '' } },
    },
    {
      enabled: !!editData?.helperId,
    },
  )

  // Create mutation
  const createMutation = client.useMutation(
    'post',
    '/api/v1/identification-helper',
    {
      onSuccess: () => {
        identificationHelpersRequest.refetch()
        setSelectedType(null)
        setHelperData(null)
        onOpenChange()
        onClose?.()
      },
    },
  )

  // Update mutation
  const updateMutation = client.useMutation(
    'put',
    '/api/v1/identification-helper/{id}',
    {
      onSuccess: () => {
        identificationHelpersRequest.refetch()
        setSelectedType(null)
        setHelperData(null)
        onOpenChange()
        onClose?.()
      },
    },
  )

  // Auto-open modal when in edit mode
  useEffect(() => {
    if (editData) {
      setSelectedType(editData.type)
      onOpen()
    }
  }, [editData, onOpen])

  // Load helper data when fetched
  useEffect(() => {
    if (editData && helperDataRequest.data) {
      // Parse the metadata and set the helper data
      try {
        const metadata = JSON.parse(helperDataRequest.data.metadata || '{}')
        setHelperData(metadata)
      } catch (error) {
        console.error('Failed to parse helper metadata:', error)
        // Fallback to empty data
        setHelperData(getEmptyDataForType(editData.type))
      }
    } else if (editData) {
      // Set empty data while loading or if no data
      setHelperData(getEmptyDataForType(editData.type))
    }
  }, [editData, helperDataRequest.data])

  function getEmptyDataForType(type: HelperTypeProps): HelperData {
    switch (type.component) {
      case 'cpe':
        return { cpe: '' } as CPEData
      case 'purl':
        return { purl: '' } as PURLData
      case 'models':
        return { models: [''] } as ModelData
      case 'sbom':
        return { sbom_urls: [''] } as SBOMData
      case 'serial':
        return { serial_numbers: [''] } as SerialData
      case 'sku':
        return { skus: [''] } as SKUData
      case 'uri':
        return { uris: [{ namespace: '', uri: '' }] } as URIData
      case 'hashes':
        return {
          file_hashes: [
            { filename: '', items: [{ algorithm: '', value: '' }] },
          ],
        } as HashData
      default:
        return {} as HelperData
    }
  }

  const canSubmit = useMemo(() => {
    if (!selectedType || !helperData) return false

    // Basic validation for different types
    switch (selectedType.component) {
      case 'cpe':
        return !!(helperData as CPEData).cpe?.trim()
      case 'purl':
        return !!(helperData as PURLData).purl?.trim()
      case 'hashes':
        const hashData = helperData as HashData
        return hashData.file_hashes.some(
          (fh) =>
            fh.filename?.trim() &&
            fh.items.some(
              (item) => item.algorithm?.trim() && item.value?.trim(),
            ),
        )
      case 'models':
        return (helperData as ModelData).models.some((m) => m?.trim())
      case 'sbom':
        return (helperData as SBOMData).sbom_urls.some((url) => url?.trim())
      case 'serial':
        return (helperData as SerialData).serial_numbers.some((sn) =>
          sn?.trim(),
        )
      case 'sku':
        return (helperData as SKUData).skus.some((sku) => sku?.trim())
      case 'uri':
        return (helperData as URIData).uris.some(
          (uri) => uri.namespace?.trim() && uri.uri?.trim(),
        )
      default:
        return false
    }
  }, [selectedType, helperData])

  const handleSubmit = () => {
    if (!selectedType || !helperData || !canSubmit || !versionId) return

    if (editData && editData.helperId) {
      // Edit mode: update existing helper via API
      updateMutation.mutate({
        params: { path: { id: editData.helperId } },
        body: {
          metadata: JSON.stringify(helperData),
        },
      })
    } else {
      // Create mode: add new helper via API
      createMutation.mutate({
        body: {
          product_version_id: versionId,
          category: selectedType.id as string,
          metadata: JSON.stringify(helperData),
        },
      })
    }

    // Reset form will be handled by the mutation success callback
  }

  const handleClose = () => {
    setSelectedType(null)
    setHelperData(null)
    onOpenChange()
    onClose?.()
  }

  const handleTypeChange = (typeId: string) => {
    const type = typesToShow.find((t) => String(t.id) === typeId)
    setSelectedType(type || null)
    if (type) {
      setHelperData(getInitialData(type.component))
    } else {
      setHelperData(null)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={handleClose}
        isDismissable={false}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {editData
              ? t('identificationHelper.editTitle', {
                  label: t(`${editData.type.translationKey}.label`),
                })
              : selectedType
                ? t('identificationHelper.createTitle', {
                    label: t(`${selectedType.translationKey}.label`),
                  })
                : t('identificationHelper.createTitle', { label: 'ID Helper' })}
          </ModalHeader>
          <ModalBody className="gap-4">
            {!editData && (
              <Select
                label={t('form.fields.helperType')}
                placeholder={t('form.fields.selectHelperType')}
                selectionMode="single"
                selectedKeys={selectedType ? [String(selectedType.id)] : []}
                onChange={(e) => handleTypeChange(e.target.value)}
                description={
                  selectedType ? 'You can change the type if needed' : undefined
                }
              >
                {typesToShow.map((type) => (
                  <SelectItem key={String(type.id)}>
                    {t(`${type.translationKey}.label`)}
                  </SelectItem>
                ))}
              </Select>
            )}

            {editData && (
              <div className="rounded-md bg-gray-100 p-3">
                <p className="text-sm font-medium text-zinc-700">
                  {t('common.editObject', {
                    label: t(`${editData.type.translationKey}.label`),
                  })}
                </p>
                <p className="text-sm text-zinc-500">
                  {t(`${editData.type.translationKey}.description`)}
                </p>
              </div>
            )}

            {selectedType && (
              <div className="flex flex-col gap-2">
                {!editData && (
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-sm text-zinc-500">
                      {t(`${selectedType.translationKey}.description`)}
                    </p>
                  </div>
                )}

                {helperData && (
                  <DynamicHelperComponent
                    type={selectedType}
                    data={helperData}
                    onChange={setHelperData}
                  />
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={!canSubmit}
            >
              {editData ? t('common.save') : t('common.create')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
