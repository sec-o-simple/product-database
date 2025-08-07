import { SelectableContext } from '@/routes/Products'
import { cn } from '@heroui/theme'
import React, { useContext } from 'react'

interface ListItemProps {
  id?: string
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
  ...props
}: Readonly<ListItemProps>) {
  const { selectable, selected, setSelected } = useContext(SelectableContext)

  const baseClassnames =
    'group flex w-full flex-col gap-1 justify-between rounded-lg bg-white px-4 py-2 border-1 border-default-200 transition-all'
  const hoverClassnames =
    'hover:bg-gray-50 group-hover:transition-background hover:cursor-pointer'
  const selectableClassnames =
    'selectable group hover:bg-gray-100 group-hover:transition-background hover:cursor-pointer'
  const isSelectedClassnames = selected.includes(props.id || '')
    ? 'bg-gray-50 border-primary-500'
    : ''

  const className = cn(
    baseClassnames,
    hoverClassnames,
    classNames?.base,
    selectable ? selectableClassnames : '',
    isSelectedClassnames,
  )

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        if (selectable && props.id) {
          const itemId = props.id
          if (selected.includes(itemId)) {
            setSelected(selected.filter((id) => id !== itemId))
          } else {
            setSelected([...selected, itemId])
          }
          return
        }
        onClick?.()
      }}
      className={className}
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

        <div
          className={cn('invisible', selectable ? '' : 'group-hover:visible')}
        >
          {actions}
        </div>
      </div>

      {chips && <div className="pb-1">{chips}</div>}
    </div>
  )
}
