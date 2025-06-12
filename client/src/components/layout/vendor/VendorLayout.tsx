import client from '@/client'
import ConfirmButton from '@/components/forms/ConfirmButton'
import PageContainer from '@/components/forms/PageContainer'
import Sidebar from '@/components/forms/Sidebar'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { TopBar } from '../TopBarLayout'
import AddProduct from './AddProduct'

export function Attribute({
  label,
  value,
  href = '',
}: {
  label: string
  value: string | number
  href?: string
}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="font-bold ">{label}</p>
      </div>
      <div
        className={cn(
          'group bg-gray-100 rounded-lg p-4 space-y-2',
          href ? 'cursor-pointer hover:bg-gray-200' : '',
        )}
        onClick={() => {
          if (href) navigate(href)
        }}
      >
        <div
          className={cn(
            'group bg-gray-100 rounded-lg px-2 py-1 space-y-2',
            href ? 'cursor-pointer hover:bg-gray-200' : '',
          )}
        >
          <p>{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function VendorLayout() {
  const { vendorId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: vendor } = client.useQuery('get', `/api/v1/vendors/{id}`, {
    params: {
      path: {
        id: vendorId || '',
      },
    },
  })

  if (!vendor) {
    return null
  }

  return (
    <PageContainer>
      <TopBar
        title={`Vendor: ${vendor.name}`}
        historyLink={`/vendors/${vendorId}/history`}
      >
        <AddProduct vendorId={vendor.id} />
      </TopBar>

      <div className="flex flex-row h-full flex-grow">
        <Sidebar
          actions={
            <div className="flex flex-row gap-4">
              <ConfirmButton
                buttonProps={{
                  color: 'danger',
                  label: 'Delete',
                  startContent: <FontAwesomeIcon icon={faTrash} />,
                }}
                confirmText="Are you sure you want to delete this vendor?"
                confirmTitle="Delete Vendor"
              />

              <Button
                variant="solid"
                color="primary"
                onPress={() =>
                  navigate(`/vendors/${vendor.id}/edit`, {
                    state: { backgroundLocation: location },
                  })
                }
              >
                Edit Vendor
              </Button>
            </div>
          }
          attributes={[
            <Attribute label="Name" value={vendor.name} />,
            <Attribute
              label="Description"
              value={vendor.description || '-/-'}
            />,
          ]}
        />

        <div className="p-4 flex-grow">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  )
}
