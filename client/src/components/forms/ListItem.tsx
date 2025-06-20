import { cn } from '@heroui/theme'
import React from 'react'

interface ListItemProps {
  title?: string | React.ReactNode
  description?: string
  chips?: React.ReactNode
  onClick?: () => void
  actions?: React.ReactNode
  classNames?: {
    base?: string
    title?: string
    description?: string
  }
}

export function ListGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
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
  classNames,
  actions,
}: Readonly<ListItemProps>) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        'group flex w-full flex-col gap-1 justify-between rounded-lg bg-white px-4 py-2 border-1 border-default-200 hover:bg-gray-50 group-hover:transition-background hover:cursor-pointer',
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
          {description && (
            <div className="text-sm text-default-500">- {description}</div>
          )}
        </div>

        <div className="invisible group-hover:visible">{actions}</div>
      </div>

      {chips && <div className="pb-1">{chips}</div>}
    </div>
  )
}
