import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import IconButton from './IconButton'
import {
  faArrowRightFromBracket,
  faEllipsisV,
  faListDots,
} from '@fortawesome/free-solid-svg-icons'
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover'
import React, { useState } from 'react'
import { Avatar } from '@heroui/react'
import { Button } from '@heroui/button'

interface ListItemProps {
  title?: string | React.ReactNode
  description?: string
  chips?: React.ReactNode
  onClick?: () => void
  menu?: React.ReactNode
}

export default function ListItem({
  title,
  description,
  chips,
  onClick,
  menu,
}: Readonly<ListItemProps>) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="group flex w-full flex-col gap-4 justify-between rounded-lg bg-white p-4 border-1 
      border-default-200 hover:bg-gray-50 group-hover:transition-background hover:cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="text-lg font-semibold group-hover:underline">
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
