import { EmptyState } from '@/routes/Vendor'
import { faRefresh, faTimeline } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { format } from 'date-fns'
import ListItem from '../forms/ListItem'

const updates = [
  {
    id: '1',
    title: 'Title updated',
    description:
      "Updated from: 'Microsoft Windows 10 Pro 64-bit' to 'Microsoft Windows 11 Pro 64-bit'",
    date: format(new Date(), 'dd.MM.yyyy'),
  },
  {
    id: '2',
    title: 'New Version added',
    description: 'Version: Microsoft Windows 11 Pro 64-bit',
    date: format(new Date(), 'dd.MM.yyyy'),
  },
  {
    id: '3',
    title: 'Description updated',
    description:
      "Updated to: 'Not available' to 'Microsoft Windows 11 Pro 64-bit with all features'",
    date: format(new Date(), 'dd.MM.yyyy'),
  },
]

export default function History({
  updates,
  refetch,
}: Readonly<{
  updates: {
    id: string
    title: string
    description: string
    date: string
  }[]
  refetch?: () => void
}>) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row justify-between align-middle items-center">
        <div className="flex flex-row items-center gap-4">
          <p className="text-2xl font-bold">History</p>

          <p>{updates.length} Updates</p>
        </div>

        <Button
          variant="bordered"
          className="rounded-xl"
          onPress={() => refetch?.()}
        >
          <FontAwesomeIcon icon={faRefresh} />
          Refresh
        </Button>
      </div>

      {updates.length === 0 && <EmptyState />}

      {updates.map((update) => (
        <ListItem
          key={update.id}
          title={update.title}
          chips={
            <Chip color="primary" variant="flat">
              <FontAwesomeIcon icon={faTimeline} className="mr-2" />
              Changed at: {update.date}
            </Chip>
          }
        />
      ))}
    </div>
  )
}
