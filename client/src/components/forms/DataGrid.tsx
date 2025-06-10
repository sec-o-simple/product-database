import { EmptyState } from '@/routes/Vendor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'
import React from 'react'

export function Titlebar({ title }: { title: string }) {
  return (
    <div className="flex w-full items-center justify-between border-1 border-gray-200 bg-white p-4 rounded-md">
      <p className="font-semibold text-xl text-primary">{title}</p>
    </div>
  )
}

export function FilterButton({
  icon,
  title,
  props,
}: {
  icon: any
  title: string
  props?: ButtonProps
}) {
  return (
    <Button
      variant="light"
      {...props}
      startContent={<FontAwesomeIcon icon={icon} />}
    >
      {title}
    </Button>
  )
}

export default function DataGrid({
  title,
  addButton,
  children,
}: {
  title?: string
  addButton?: React.ReactNode
  children: React.ReactNode[] | React.ReactNode | undefined
}) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      {title && (
        <div className="flex w-full items-center justify-between border-1 border-gray-200 bg-white p-4 rounded-md">
          <p className="font-semibold text-xl text-primary">{title}</p>
        </div>
      )}

      {/** Empty State */}
      {!children && <EmptyState add={addButton} />}

      <div className="flex flex-col w-full gap-2">{children}</div>

      {/* <Pagination /> */}
    </div>
  )
}
