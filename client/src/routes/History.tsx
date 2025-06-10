import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ListItem from '@/components/forms/ListItem'
import { faRefresh, faTimeline } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem, Button, Chip } from '@heroui/react'
import moment from 'moment'
import { useParams } from 'react-router-dom'

const updates = [
  {
    id: '1',
    title: 'Title updated',
    description:
      "Updated from: 'Microsoft Windows 10 Pro 64-bit' to 'Microsoft Windows 11 Pro 64-bit'",
    date: moment().format('DD.MM.yyyy'),
  },
  {
    id: '2',
    title: 'New Version added',
    description: 'Version: Microsoft Windows 11 Pro 64-bit',
    date: moment().format('DD.MM.yyyy'),
  },
  {
    id: '3',
    title: 'Description updated',
    description:
      "Updated to: 'Not available' to 'Microsoft Windows 11 Pro 64-bit with all features'",
    date: moment().format('DD.MM.yyyy'),
  },
]

export default function History() {
  const { productId } = useParams()

  const vendor = undefined
  const { data: product } = client.useQuery('get', `/api/v1/products/{id}`, {
    params: {
      path: {
        id: productId || '',
      },
    },
  })

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      <Breadcrumbs>
        <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
        <BreadcrumbItem>{'xxx'}</BreadcrumbItem>
        <BreadcrumbItem>Products</BreadcrumbItem>
        <BreadcrumbItem>{product?.name}</BreadcrumbItem>
        <BreadcrumbItem>Object History</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-row justify-between align-middle items-center">
          <div className="flex flex-row items-center gap-4">
            <p className="text-2xl font-bold">Object History</p>

            <p>2 Updates</p>
          </div>

          <Button variant="bordered" className="rounded-xl">
            <FontAwesomeIcon icon={faRefresh} />
            Refresh
          </Button>
        </div>

        {updates.map((update) => (
          <ListItem
            key={update.id}
            title={update.title}
            description={update.description}
            chips={
              <Chip color="primary" variant="flat">
                <FontAwesomeIcon icon={faTimeline} className="mr-2" />
                Changed at: {update.date}
              </Chip>
            }
          />
        ))}
      </div>
    </div>
  )
}
