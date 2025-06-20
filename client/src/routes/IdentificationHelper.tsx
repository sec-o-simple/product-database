import Breadcrumbs from '@/components/forms/Breadcrumbs'
import { Input } from '@/components/forms/Input'
import {
  AddIdHelper,
  idHelperTypes,
} from '@/components/layout/product/ProductLayout'
import { EmptyState } from '@/components/table/EmptyState'
import { faAdd, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { BreadcrumbItem, Tooltip } from '@heroui/react'
import React, { useState } from 'react'

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
}

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
          {data.fields.map((field) =>
            edit ? (
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
              </div>
            ) : (
              <div key={field.id}>
                <div className="text-sm text-default-500">{field.label}</div>
                <div className="text-lg font-medium">{field.value}</div>
              </div>
            ),
          )}
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
  add,
}: {
  label: string
  description: string
  items: ItemProps[]
  setHelper?: React.Dispatch<React.SetStateAction<IDTypeProps[]>>
  deleteable?: boolean
  add?: React.ReactNode
}) {
  const [showMore, setShowMore] = useState(items.length > 3)

  return (
    <div className="flex flex-col bg-white border-1 border-gray-200 p-4 gap-2 rounded-md group">
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

export default function IdentificationHelper({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const [helper, setHelper] = useState([] as IDTypeProps[])

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
    <div className="flex h-full w-full flex-col gap-4 p-2">
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem href="/vendors/1">Products</BreadcrumbItem>
          <BreadcrumbItem href="/products/1">Microsoft Office</BreadcrumbItem>
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
                    // setHelper((prev) =>
                    //   prev.map((h, index) => {
                    //     if (h.label === existingType.label) {
                    //       return {
                    //         ...h,
                    //         items: [
                    //           ...h.items,
                    //           {
                    //             id: index + 1,
                    //             fields: existingType.fields.map((f) => ({
                    //               ...f,
                    //               value: '',
                    //             })),
                    //           },
                    //         ],
                    //       }
                    //     }
                    //     return h
                    //   }),
                    // )
                  }}
                >
                  Add {helper.label}
                </Button>
              }
            />
          )
        })}
      </div>
    </div>
  )
}
