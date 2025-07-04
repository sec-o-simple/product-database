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
  headerActions,
}: {
  title: string
  headerActions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col rounded-lg bg-white">
      <div className="flex items-center justify-between rounded-t-lg border-1 border-b-0 border-default-200 p-4">
        <p className="text-lg font-bold">{title}</p>
        {headerActions && (
          <div className="flex items-center gap-2">{headerActions}</div>
        )}
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
        <div className="flex items-center gap-2">
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
