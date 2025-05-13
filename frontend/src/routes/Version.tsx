import Breadcrumbs from '@/components/forms/Breadcrumbs'
import LatestChip from '@/components/forms/Latest'
import ListItem, { ListGroup } from '@/components/forms/ListItem'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import Pagination from '@/components/table/Pagination'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { BreadcrumbItem, Chip } from '@heroui/react'
import { useParams } from 'react-router-dom'

export default function Version() {
  const { productId } = useParams()
  // find the correct product by id
  const product = fakeVendors
    .find((vendor) =>
      vendor.products?.some((product) => String(product.id) === productId),
    )
    ?.products?.find((product) => String(product.id) === productId)

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      <Breadcrumbs>
        <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
        <BreadcrumbItem href="/vendors/1">Products</BreadcrumbItem>
        <BreadcrumbItem href="/products/1">Versions</BreadcrumbItem>
        <BreadcrumbItem>{product?.name}</BreadcrumbItem>
      </Breadcrumbs>
      <div className="flex w-full flex-col items-center gap-4">
        <ListGroup title="Installed On">
          {product?.versions?.map((version) => (
            <ListItem
              key={version.id}
              classNames={{
                base: 'border-default-200 border-b-0 rounded-none',
              }}
              title={
                <div className="flex gap-2 items-center">
                  {version.id === 1 && <LatestChip />}

                  <p>{version.name}</p>
                </div>
              }
              description={version.description}
            />
          ))}

          <Pagination
            classNames={{
              base: 'rounded-t-none',
            }}
          />
        </ListGroup>

        <ListGroup title="Component Of">
          {product?.versions?.map((version) => (
            <ListItem
              key={version.id}
              classNames={{
                base: 'border-default-200 border-b-0 rounded-none',
              }}
              title={
                <div className="flex gap-2 items-center">
                  {version.id === 1 && <LatestChip />}

                  <p>{version.name}</p>
                </div>
              }
              description={version.description}
              chips={
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Chip variant="flat" className="rounded-md">
                      Version: 1.2.0
                    </Chip>
                    <Chip variant="flat" className="rounded-md">
                      Version: 1.2.1
                    </Chip>
                  </div>

                  <Button
                    variant="light"
                    color="primary"
                    size="sm"
                    startContent={<FontAwesomeIcon icon={faAdd} />}
                  >
                    Add Version
                  </Button>
                </div>
              }
            />
          ))}

          <Pagination
            classNames={{
              base: 'rounded-t-none',
            }}
          />
        </ListGroup>
      </div>
    </div>
  )
}
