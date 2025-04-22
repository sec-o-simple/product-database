import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import IconButton from './IconButton'
import { faEllipsisV, faListDots } from '@fortawesome/free-solid-svg-icons'
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react'

interface ListItemProps {
  title?: string
  description?: string
  chips?: React.ReactNode
  onClick?: () => void
}

export default function ListItem({
  title,
  description,
  chips,
  onClick,
}: Readonly<ListItemProps>) {
  return (
    <div
      onClick={onClick}
      className="flex w-full flex-col gap-4 justify-between rounded-lg bg-white p-4 border-1 border-default-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-default-500">- {description}</div>
        </div>

        <IconButton icon={faEllipsisV} />
      </div>

      {chips}
    </div>
  )
}
