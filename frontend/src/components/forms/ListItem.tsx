import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { cn } from '@heroui/theme'
import React from 'react'

interface ListItemProps {
  title?: string | React.ReactNode
  description?: string
  chips?: React.ReactNode
  onClick?: () => void
  menu?: React.ReactNode
  classNames?: {
    base?: string
    title?: string
    description?: string
  }
}

export function ListGroup({
  title,
  children,
  classNames,
}: {
  title: string
  children: React.ReactNode
  classNames?: {
    base?: string
  }
}) {
  return (
    <div className="flex w-full flex-col bg-white rounded-lg">
      <div className="flex items-center justify-between p-4 border-1 border-b-0 rounded-t-lg border-default-200">
        <p className="font-bold text-lg">{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function ListItem({
  title,
  description,
  chips,
  onClick,
  menu,
  classNames,
}: Readonly<ListItemProps>) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        'group flex w-full flex-col gap-4 justify-between rounded-lg bg-white p-4 border-1 border-default-200 hover:bg-gray-50 group-hover:transition-background hover:cursor-pointer',
        classNames?.base,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div
            className={cn(
              'text-lg font-semibold group-hover:underline',
              classNames?.title,
            )}
          >
            {title}
          </div>
          <div className="text-sm text-default-500">- {description}</div>
        </div>

        {menu && (
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button
                isIconOnly={true}
                variant="light"
                className="rounded-full text-neutral-foreground"
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 rounded-medium">
              {menu}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {chips}
    </div>
  )
}
