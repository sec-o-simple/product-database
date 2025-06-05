import History from '@/components/forms/HistoryButton'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useMemo } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import IconButton from '../../forms/IconButton'
import { UserAvatar } from '../TopBarLayout'
import AddProduct from '../product/CreateEditProduct'

export const fakeVendors = [
  {
    id: 1,
    name: 'Microsoft',
    description:
      'Microsoft is a technology company that develops software, hardware, and services.',
    products: [
      {
        id: 1,
        name: 'Microsoft Office',
        description: 'A suite of productivity applications.',
        versions: [
          {
            id: 1,
            name: 'Microsoft Office 2019',
            description: 'The latest version of Microsoft Office.',
          },
          {
            id: 2,
            name: 'Microsoft Office 365',
            description: 'A subscription-based version of Microsoft Office.',
          },
        ],
      },
      {
        id: 2,
        name: 'Microsoft Windows',
        description: 'An operating system for personal computers.',
        versions: [
          {
            id: 1,
            name: 'Windows 10',
            description: 'The latest version of Windows.',
          },
        ],
      },
      {
        id: 3,
        name: 'Microsoft Azure',
        description: 'A cloud computing service.',
      },
    ],
  },
  {
    id: 2,
    name: 'Google',
    description:
      'Google is a technology company that specializes in Internet-related services and products.',
  },
  {
    id: 3,
    name: 'Apple',
    description:
      'Apple is a technology company that designs, manufactures, and sells consumer electronics, computer software, and online services.',
  },
]

export function getVendorById(vendorId: number) {
  return fakeVendors.find((vendor) => vendor.id === vendorId)
}

export function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 space-y-2">
      <div>
        <p className="font-bold">{label}</p>
      </div>

      <div className="flex justify-end">
        <p>{value}</p>
      </div>
    </div>
  )
}

export default function VendorLayout() {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const vendor = useMemo(() => {
    return getVendorById(Number(vendorId))
  }, [vendorId])

  if (!vendor?.name) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-2 text-2xl font-bold">
          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
          <p>Vendor: {vendor?.name}</p>
        </span>

        <div className="flex flex-row gap-4">
          <History />

          <AddProduct />

          <UserAvatar />
        </div>
      </div>

      <div className="flex flex-row h-full flex-grow">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Name" value={vendor?.name} />

          <Attribute label="Description" value={vendor?.description} />
        </div>
        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
