import client from '@/client'
import ConfirmButton from '@/components/forms/ConfirmButton'
import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { TopBar } from '../TopBarLayout'
import { AddProductButton } from '../product/CreateEditProduct'

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
          'group bg-gray-50 border rounded-lg p-2 space-y-2',
          href ? 'cursor-pointer hover:bg-gray-200 hover:transition-all' : '',
        )}
        onClick={() => {
          if (href) navigate(href)
        }}
      >
        <div
          className={cn(
            'rounded-lg px-2 py-1 space-y-2',
            href ? 'cursor-pointer group-hover:underline text-primary' : '',
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
        <AddProductButton vendorId={vendor.id} />
      </TopBar>

      <div className="flex flex-row flex-grow overflow-scroll">
        <Sidebar
          actions={
            <div className="flex flex-row gap-2">
              <ConfirmButton
                color="danger"
                startContent={<FontAwesomeIcon icon={faTrash} />}
                confirmText="Are you sure you want to delete this vendor?"
                confirmTitle="Delete Vendor"
                onConfirm={() => {}}
              >
                Delete
              </ConfirmButton>

              <Button
                variant="solid"
                color="primary"
                fullWidth
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

        <PageOutlet>
          <Outlet />
        </PageOutlet>
      </div>
    </PageContainer>
  )
}
