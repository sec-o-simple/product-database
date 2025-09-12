import PageContainer from '@/components/forms/PageContainer'
import { PageOutlet } from '@/components/forms/PageContent'
import Sidebar from '@/components/forms/Sidebar'
import { DeleteVendor, useVendorQuery } from '@/routes/Vendor'
import useRouter from '@/utils/useRouter'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { TopBar } from '../TopBarLayout'
import { AddProductButton } from '../product/CreateEditProduct'

export function Attribute({
  label,
  value,
  href = '',
  onClick,
}: {
  label: string
  value: string | number | React.ReactNode
  href?: string
  onClick?: () => void
}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="font-bold ">{label}</p>
      </div>
      <div
        className={cn(
          'group bg-gray-50 border border-default-200 rounded-lg p-2 space-y-2',
          href || onClick
            ? 'cursor-pointer hover:bg-gray-200 hover:transition-all'
            : '',
        )}
        onClick={() => {
          if (href) navigate(href)
          if (onClick) onClick()
        }}
      >
        <div
          className={cn(
            'rounded-lg px-2 py-1 space-y-2',
            href || onClick
              ? 'cursor-pointer group-hover:underline text-primary'
              : '',
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
  const { t } = useTranslation()

  const { vendorId } = useParams()
  const { data: vendor } = useVendorQuery(vendorId || '')

  if (!vendor) {
    navigate('/vendors')

    return null
  }

  return (
    <PageContainer>
      <TopBar
        title={`${t('vendor.label')}: ${vendor.name}`}
        backLink="/vendors"
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
                {t('common.edit')}
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
