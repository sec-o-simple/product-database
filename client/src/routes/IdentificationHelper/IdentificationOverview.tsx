import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import { Input } from '@/components/forms/Input'
import PageContent from '@/components/forms/PageContent'
import { EmptyState } from '@/components/table/EmptyState'
import { faAdd, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Tooltip,
} from '@heroui/react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AddIdHelper } from './AddIDHelper'

interface IDTypeProps {
  id: number
  label: string
  items: ItemProps[]
}

interface ItemProps {
  id: number
  fields: FieldProps[]
}

interface FieldProps {
  id: number
  label: string
  value: string
  items?: ItemProps[]
}

type FieldType =
  | { type: 'text'; key: string; label: string; required?: boolean }
  | { type: 'number'; key: string; label: string; required?: boolean }
  | { type: 'date'; key: string; label: string; required?: boolean }
  | { type: 'hashes'; key: string; label: string; hashes: string[] }
  | { type: 'file'; key: string; label: string; subFields: FieldType[] }

export interface HelperTypeProps {
  id: number | string
  label: string
  entryTitle: string
  description: string
  fields: FieldType[]
}

export const idHelperTypes = [
  {
    id: 1,
    label: 'Hashes',
    entryTitle: 'Hash',
    description:
      'A hash is a fixed-size string of characters generated from data of any size. It is used to verify the integrity of data.',
    fields: [
      { label: 'Algorithm of the hash', type: 'text' },
      { label: 'Hash Value', type: 'text' },
    ],
  },
  {
    id: 2,
    label: 'Models',
    entryTitle: 'Model',
    description:
      'A model is a specific version or variant of a product. It is used to identify the product in the market.',
    fields: [{ label: 'Model Number', type: 'text' }],
  },
  {
    id: 3,
    label: 'SBOM URLs',
    entryTitle: 'SBOM URL',
    description:
      'A Software Bill of Materials (SBOM) URL is a link to a document that lists the components of a software product. It is used to identify the software components and their versions.',
    fields: [{ label: 'SBOM URL', type: 'text' }],
  },
  {
    id: 4,
    label: 'Serial Numbers',
    entryTitle: 'Serial Number',
    description:
      'A serial number is a unique identifier assigned to a product. It is used to track the product throughout its lifecycle.',
    fields: [{ label: 'Serial Number', type: 'text' }],
  },
  {
    id: 5,
    label: 'Stock Keeping Units (SKUs)',
    entryTitle: 'SKU',
    description:
      'A Stock Keeping Unit (SKU) is a unique identifier assigned to a product for inventory management. It is used to track the product in the supply chain.',
    fields: [{ label: 'Stock Keeping Unit', type: 'text' }],
  },
  {
    id: 6,
    label: 'Generic URIs',
    entryTitle: 'URI',
    description:
      'A Uniform Resource Identifier (URI) is a string of characters that identifies a particular resource. It is used to identify the product in the market.',
    fields: [
      { label: 'Namespace of URI', type: 'text' },
      { label: 'URI', type: 'text' },
    ],
  },
] as HelperTypeProps[]

function IndentificationItem({
  data,
  chips,
  onUpdate,
  onDelete,
}: {
  data: ItemProps
  chips?: React.ReactNode
  onUpdate: (data: ItemProps, fields: FieldProps[]) => void
  onDelete: () => void
}) {
  const [edit, setEdit] = useState(false)
  const [editFields, setEditFields] = useState(data.fields)

  return (
    <div className="flex w-full flex-col gap-2 justify-between bg-gray-50 px-4 py-2 rounded-lg border-1 border-default-200 hover:bg-gray-100 hover:transition-background">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 grow">
          {data.fields.map((field) => {
            if (!edit)
              return (
                <div key={field.id}>
                  <div className="text-sm text-default-500">{field.label}</div>
                  <div className="text-lg font-medium">{field.value}</div>
                </div>
              )
            return (
              <div
                key={field.id}
                className="flex flex-col gap-2 py-1 items-end"
              >
                <Input
                  type="text"
                  label={field.label}
                  labelPlacement="outside"
                  classNames={{
                    inputWrapper: 'bg-white',
                  }}
                  value={editFields.find((f) => f.id === field.id)?.value}
                  onChange={(e) => {
                    setEditFields((prev) =>
                      prev.map((f) => {
                        if (f.id === field.id) {
                          return { ...f, value: e.target.value }
                        }
                        return f
                      }),
                    )
                  }}
                />
                {field.items && (
                  <Accordion defaultExpandedKeys={['0']}>
                    {field.items.map((subItems, index) => (
                      <AccordionItem
                        key={index}
                        title={subItems.fields[0].label}
                      >
                        <div className="flex flex-col gap-2 mb-2">
                          {subItems.fields.map((subField) => (
                            <Input
                              key={subField.id}
                              type="text"
                              label={subField.label}
                              labelPlacement="outside"
                              classNames={{
                                inputWrapper: 'bg-white',
                              }}
                              value={
                                editFields.find((f) => f.id === subField.id)
                                  ?.value || ''
                              }
                              onChange={(e) => {
                                setEditFields((prev) =>
                                  prev.map((f) => {
                                    if (f.id === subField.id) {
                                      return { ...f, value: e.target.value }
                                    }
                                    return f
                                  }),
                                )
                              }}
                            />
                          ))}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            )
          })}
          {edit && (
            <div className="flex justify-end gap-2">
              <Button variant="light" size="sm" onPress={() => setEdit(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={() => {
                  setEdit(false)
                  onUpdate(data, editFields)
                }}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {chips}
    </div>
  )
}

export function IdentificationGroup({
  label,
  description,
  items,
  setHelper,
  deleteable = false,
  onClick,
  add,
}: {
  label: string
  description: string
  items: ItemProps[]
  setHelper?: React.Dispatch<React.SetStateAction<IDTypeProps[]>>
  deleteable?: boolean
  onClick?: () => void
  add?: React.ReactNode
}) {
  const [showMore, setShowMore] = useState(items.length > 3)

  return (
    <div
      className={`flex flex-col bg-white border-1 border-gray-200 p-4 gap-2 rounded-md group ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-lg">{label}</p>

          {deleteable && (
            <Tooltip content="Delete Entry" placement="bottom">
              <Button
                isIconOnly
                variant="light"
                color="primary"
                className="invisible group-hover:visible"
                onPress={() => {
                  if (!setHelper) return

                  setHelper((prev) => prev.filter((h) => h.label !== label))
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </Tooltip>
          )}
        </div>
        <Tooltip
          content={description}
          placement="bottom"
          closeDelay={0}
          className="max-w-[400px]"
        >
          <p className="text-zinc-500 line-clamp-2">{description}</p>
        </Tooltip>
      </div>

      {items.map((item, index) => {
        if (!showMore && index + 1 > 3) return null

        return (
          <IndentificationItem
            key={item.id}
            data={item}
            onUpdate={(data, fields) => {
              if (!setHelper) return

              setHelper((prev) =>
                prev.map((h) => {
                  if (h.label === label) {
                    return {
                      ...h,
                      items: h.items.map((i) => {
                        if (i.id === data.id) {
                          return {
                            ...i,
                            fields: fields.map((f) => ({
                              ...f,
                              value: f.value,
                            })),
                          }
                        }
                        return i
                      }),
                    }
                  }
                  return h
                }),
              )
            }}
            onDelete={() => {
              if (!setHelper) return

              setHelper((prev) =>
                prev.map((h) => {
                  if (h.label === label) {
                    return {
                      ...h,
                      items: h.items.filter((i) => i.id !== item.id),
                    }
                  }
                  return h
                }),
              )
            }}
          />
        )
      })}

      {items.length > 3 && (
        <Button
          variant="light"
          color="primary"
          onPress={() => setShowMore(!showMore)}
        >
          {showMore ? 'Show less' : 'Show more'}
        </Button>
      )}

      {add}
    </div>
  )
}

export default function IdentificationOverview({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { productId, versionId } = useParams()
  const navigate = useNavigate()
  const [helper, setHelper] = useState([] as IDTypeProps[])

  const { data: product } = client.useQuery('get', `/api/v1/products/{id}`, {
    params: { path: { id: productId || '' } },
  })

  const { data: version } = client.useQuery(
    'get',
    '/api/v1/product-versions/{id}',
    {
      params: { path: { id: versionId || '' } },
    },
  )

  const idHelperTypes = [] as HelperTypeProps[]

  function handleAddIdHelper(type: { id: number; label: string }) {
    setHelper((prev) => {
      const existingType = prev.find((t) => t.label === type.label)
      if (existingType) {
        return prev
      }
      return [
        ...prev,
        {
          id: type.id,
          label: type.label,
          items: [],
        },
      ]
    })
  }

  return (
    <PageContent>
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem href={`/vendors/${product?.vendor_id}`}>
            Vendor
          </BreadcrumbItem>
          <BreadcrumbItem href={`/products/${product?.id}`}>
            {product?.name || 'Product'}
          </BreadcrumbItem>
          <BreadcrumbItem isDisabled>Versions</BreadcrumbItem>
          <BreadcrumbItem href={`/products/${productId}/versions/${versionId}`}>
            {version?.name || 'Version'}
          </BreadcrumbItem>
          <BreadcrumbItem>Identification Helper</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <div className="flex w-full items-center justify-between border-1 border-gray-200 bg-white p-4 rounded-md">
        <p className="font-semibold text-xl text-primary">
          Identification Helper
        </p>

        <AddIdHelper
          onAdd={handleAddIdHelper}
          isDisabled={(type) => helper.some((h) => h.id === type.id)}
        />
      </div>

      {helper.length === 0 && (
        <EmptyState add={<AddIdHelper onAdd={handleAddIdHelper} />} />
      )}

      <div className="grid grid-cols-2 gap-2">
        {helper.map((helper) => {
          const existingType = idHelperTypes.find((t) => t.id === helper.id)
          if (!existingType) return null

          return (
            <IdentificationGroup
              key={existingType.label}
              label={existingType.label}
              description={existingType.description}
              items={helper.items}
              setHelper={setHelper}
              deleteable={true}
              add={
                <Button
                  variant="bordered"
                  className="border-dashed text-gray border-gray"
                  startContent={<FontAwesomeIcon icon={faAdd} />}
                  onPress={() => {
                    navigate(
                      `/products/${productId}/versions/${versionId}/identification-helper/${existingType.id}`,
                    )
                  }}
                >
                  Add {helper.label}
                </Button>
              }
            />
          )
        })}
      </div>
    </PageContent>
  )
}
