import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'
import React from 'react'
import { EmptyState } from '../table/EmptyState'

export function Titlebar({ title }: { title: string }) {
  return (
    <div className="flex w-full items-center justify-between border-1 border-gray-200 bg-white p-4 rounded-md">
      <p className="font-semibold text-xl text-primary">{title}</p>
    </div>
  )
}

type FilterButtonProps = {
  icon: any
  title: string
} & ButtonProps

export function FilterButton({ icon, title, ...props }: FilterButtonProps) {
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
        <div className="flex w-full items-center justify-between border-1 border-gray-200 bg-white p-4 rounded-lg">
          <p className="font-semibold text-xl text-primary">{title}</p>
        </div>
      )}

      {!children && <EmptyState add={addButton} />}

      <div className="flex flex-col w-full gap-2">{children}</div>

      {/* <Pagination /> */}
    </div>
  )
}
