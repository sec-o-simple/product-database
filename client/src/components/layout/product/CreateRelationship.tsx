import client from '@/client'
import Select from '@/components/forms/Select'
import { useProductListQuery } from '@/routes/Products'
import useRouter from '@/utils/useRouter'
import { faAdd, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import { addToast, Button } from '@heroui/react'
import { SelectItem } from '@heroui/select'
import React, { useState } from 'react'

interface RelationShipProps {
  sourceProducts: string[]
  sourceVersions: string[]
  targetProducts: string[]
  targetVersions: string[]
  relationshipType: string
  description: string
}

const relationshipTypes = [
  'Installed On',
  'Installed With',
  'Optional Component Of',
  'Default Component Of',
  'External Component Of',
]

function ProductBox({
  products,
  versions,
}: {
  products: string[]
  versions: string[]
}) {
  return (
    (products.length !== 0 || versions.length !== 0) && (
      <div className="border border-gray items-center bg-white rounded-lg p-2 px-4 flex flex-col">
        <div className="flex flex-col gap-1">
          {products.map((product) => (
            <p key={product}>{product}</p>
          ))}
        </div>

        <p className="text-sm text-zinc-500">Versions: {versions.join(', ')}</p>
      </div>
    )
  )
}

export function AddRelationshipButton() {
  const {
    navigateToModal,
    params: { versionId },
  } = useRouter()

  return (
    <Button
      color="primary"
      startContent={<FontAwesomeIcon icon={faAdd} />}
      onPress={() =>
        addToast({
          title: 'Not implemented yet',
        })
        // navigateToModal(
        //   `/product-versions/${versionId}/relationships/create`,
        // )
      }
    >
      Add Relationship
    </Button>
  )
}

export default function CreateRelationship() {
  const {
    goBack,
    params: { versionId },
  } = useRouter()

  const [selected, setSelected] = useState<RelationShipProps>({
    sourceProducts: [versionId || ''],
    sourceVersions: [],
    targetProducts: [],
    targetVersions: [],
    relationshipType: '',
    description: '',
  })

  const { data: products } = useProductListQuery()

  let versions: { id: string, name: string }[] = []
  // if (products && products.length > 0) {
  //   for (const product of products) {
  //     const { data: productVersions } = useVersionListQuery(product.id) as {
  //       data: VersionProps[]
  //     }

  //     if (versions) {
  //       versions.push(...(productVersions || []))
  //     }
  //   }
  // }

  const handleSelect = (key: React.ChangeEvent<HTMLSelectElement>) => {
    const value = key.target.value.split(',').filter((v) => v !== 'all')

    setSelected((prevState) => ({
      ...prevState,
      [key.target.name]: value,
    }))
  }

  const SelectAll = (property: keyof RelationShipProps) => {
    const key = property as keyof RelationShipProps
    return (
      <SelectItem
        key="all"
        onClick={() => {
          const newValue =
            selected[key].length === versions.length
              ? ([] as string[])
              : versions.map((version) => version.id)

          setSelected((prevState) => ({
            ...prevState,
            [key]: newValue,
          }))
        }}
      >
        {selected[key].length === versions.length
          ? 'Unselect All'
          : 'Select All'}
      </SelectItem>
    )
  }

  const onClose = () => {
    goBack()
  }

  const mutation = client.useMutation('post', '/api/v1/relationships', {
    onSuccess: onClose,
  })

  const handleCreateRelationship = () => {
    mutation.mutate({
      body: {
        category: 'installed_on',
        source_node_id: selected.sourceProducts[0],
        target_node_id: selected.targetVersions[0],
      },
    })
  }

  return (
    <Modal isOpen isDismissable={false} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Create Product Relationship
        </ModalHeader>
        <ModalBody className="gap-4">
          {/* <div className="flex flex-row gap-2">
              <Select
                label="Source Product"
                name="sourceProducts"
                className="w-2/3"
                selectionMode="multiple"
                selectedKeys={selected.sourceProducts}
                onChange={handleSelect}
              >
                <>
                  {products.map((product) => (
                    <SelectItem key={product.id}>{product.name}</SelectItem>
                  ))}
                </>
              </Select>

              <Select
                label="Version"
                name="sourceVersions"
                selectionMode="multiple"
                className="w-1/3"
                selectedKeys={selected.sourceVersions}
                onChange={handleSelect}
                renderValue={(value) => {
                  if (value.length === versions.length) return 'All'
                  return value
                    .map(
                      (v) =>
                        versions.find((version) => version.id === v.key)?.name,
                    )
                    .join(', ')
                }}
              >
                <>
                  {SelectAll('sourceVersions')}
                  {versions.map((version) => (
                    <SelectItem key={version.id}>{version.name}</SelectItem>
                  ))}
                </>
              </Select>
            </div> */}

          <div className="flex flex-row gap-2">
            <Select
              label="Target Product"
              name="targetProducts"
              selectionMode="multiple"
              onChange={handleSelect}
              className="w-2/3"
              selectedKeys={selected.targetProducts}
            >
              <>
                {products?.map((product) => (
                  <SelectItem key={product.id}>{product.name}</SelectItem>
                ))}
              </>
            </Select>

            <Select
              label="Version"
              name="targetVersions"
              selectionMode="multiple"
              onChange={handleSelect}
              className="w-1/3"
              renderValue={(value) => {
                if (value.length === versions.length) return 'All'
                return value
                  .map(
                    (v) =>
                      versions.find((version) => version.id === v.key)?.name,
                  )
                  .join(', ')
              }}
              selectedKeys={selected.targetVersions}
            >
              <>
                {SelectAll('targetVersions')}
                {versions.map((version) => (
                  <SelectItem key={version.id}>{version.name}</SelectItem>
                ))}
              </>
            </Select>
          </div>

          <Select
            label="Relationship Type"
            placeholder="Select a type"
            selectionMode="single"
            selectedKeys={selected.relationshipType}
            onChange={(key) =>
              setSelected((prevState) => ({
                ...prevState,
                relationshipType: key.target.value as string,
              }))
            }
          >
            {relationshipTypes.map((type) => (
              <SelectItem key={type}>{type}</SelectItem>
            ))}
          </Select>
          {/* 
            <Input
              label="Description"
              placeholder="Enter the description..."
              className="w-full"
              type="text"
              value={selected.description}
              onChange={(e) => {
                setSelected((prevState) => ({
                  ...prevState,
                  description: e.target.value,
                }))
              }}
            /> */}

          <div className="flex flex-row gap-2 bg-gray-100 items-center rounded-md p-4 justify-around">
            {/* <ProductBox
              products={selected.sourceProducts.map(
                (product) =>
                  products?.find((p) => p.id === product)?.name as string,
              )}
              versions={selected.sourceVersions.map(
                (version) =>
                  versions.find((v) => v.id === version)?.name as string,
              )}
            /> */}

            <div className="flex flex-col items-center space-y-2">
              <FontAwesomeIcon
                icon={faArrowRight}
                size="xl"
                className="text-primary"
              />
              <p className="text-sm text-zinc-500">
                {relationshipTypes.find(
                  (type) => type === selected.relationshipType,
                )}
              </p>
            </div>

            <ProductBox
              products={selected.targetProducts.map(
                (product) =>
                  products?.find((p) => p.id === product)?.name as string,
              )}
              versions={selected.targetVersions.map(
                (version) =>
                  versions.find((v) => v.id === version)?.name as string,
              )}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleCreateRelationship}
            isLoading={mutation.isPending}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
