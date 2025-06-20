import client from '@/client'
import PageContent from '@/components/forms/PageContent'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/react'
import React from 'react'
import { Navigate, useParams } from 'react-router-dom'

const hashes = [
  {
    id: 'md5',
    name: 'MD5',
    description: 'MD5 hash of the file',
    value: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
  {
    id: 'sha1',
    name: 'SHA1',
    description: 'SHA1 hash of the file',
    value: 'abcdef1234567890abcdef1234567890abcdef12345678',
  },
  {
    id: 'sha256',
    name: 'SHA256',
    description: 'SHA256 hash of the file',
    value: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
  {
    id: 'sha512',
    name: 'SHA512',
    description: 'SHA512 hash of the file',
    value:
      'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
]

function IdentificationItem() {
  const [edit, setEdit] = React.useState(false)

  return (
    <div className="flex flex-col w-full border-1 border-gray-200 bg-white rounded-md">
      <div className="flex justify-between items-center p-4">
        <p className="text-xl font-semibold">document.pdf</p>

        <div className="flex items-center gap-2">
          <Button color="primary" variant="light" size="sm">
            <FontAwesomeIcon icon={faAdd} />
            Add New Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t-1 border-gray-200 p-4">
        {hashes.map((hash) => (
          <div className="flex flex-col bg-gray-50 border-1 border-gray-200 p-4 gap-2 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">{hash.id}</p>
            </div>

            <div className="space-y-2 p-4 bg-white rounded-md border border-gray-300">
              <p className="text-sm text-neutral-500">Hash Value</p>
              <p className="text-xs text-gray-200 text-wrap break-words">
                {hash.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Helper() {
  const { helperId, productId, versionId } = useParams()

  const { data: product } = client.useQuery('get', `/api/v1/products/{id}`, {
    params: { path: { id: productId || '' } },
  })

  if (!helperId) {
    return <Navigate to="/products" replace />
  }

  return (
    <PageContent>
      {/* <Breadcrumbs>
        <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
        <BreadcrumbItem>{'xxx'}</BreadcrumbItem>
        <BreadcrumbItem>Products</BreadcrumbItem>
        <BreadcrumbItem>{product?.name}</BreadcrumbItem>
        <BreadcrumbItem>Versions</BreadcrumbItem>
        <BreadcrumbItem>{version?.name}</BreadcrumbItem>
        <BreadcrumbItem
          href={`/products/${productId}/versions/${versionId}/identification-helper`}
        >
          Identification Helper
        </BreadcrumbItem>
        <BreadcrumbItem>{helper?.entryTitle}</BreadcrumbItem>
      </Breadcrumbs> */}

      {/* <div className="flex flex-col w-full border-1 border-gray-200 bg-white p-4 gap-4 rounded-md">
        <div className="flex justify-between items-center">
          <p className="text-xl font-semibold">{helper?.entryTitle ?? ''}</p>

          <AddIdHelperItem />
        </div>

        <p className="text-sm text-gray-500">
          {helper?.description ?? 'No description available.'}
        </p>
      </div> */}

      <IdentificationItem />
    </PageContent>
  )
}
