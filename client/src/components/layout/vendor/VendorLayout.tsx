import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import { DeleteVendor, useVendorQuery } from '@/routes/Vendor'
import useRouter from '@/utils/useRouter'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
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
  const { navigateToModal, navigate } = useRouter()

  const { vendorId } = useParams()
  const { data: vendor } = useVendorQuery(vendorId || '')

  if (!vendor) {
    navigate('/vendors')

    return null
  }

  return (
    <PageContainer>
      <TopBar
        title={`Vendor: ${vendor.name}`}
        historyLink={`/vendors/${vendorId}/history`}
      >
        <AddProductButton vendorId={vendor.id?.toString()} />
      </TopBar>

      <div className="flex grow flex-row overflow-scroll">
        <Sidebar
          actions={
            <div className="flex flex-row gap-2">
              <DeleteVendor vendor={vendor} />

              <Button
                variant="solid"
                color="primary"
                fullWidth
                onPress={() =>
                  navigateToModal(
                    `/vendors/${vendor.id}/edit`,
                    `/vendors/${vendor.id}`,
                  )
                }
              >
                Edit Vendor
              </Button>
            </div>
          }
          attributes={[
            <Attribute label="Name" value={vendor.name} key="name" />,
            <Attribute
              key="idHelpers"
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
