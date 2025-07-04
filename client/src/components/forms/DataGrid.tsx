import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'
import React from 'react'
import { EmptyState } from '../table/EmptyState'

export function Titlebar({ title }: { title: string }) {
  return (
    <div className="flex w-full items-center justify-between rounded-md border-1 border-gray bg-white p-4">
      <p className="text-xl font-semibold text-primary">{title}</p>
    </div>
  )
}

type FilterButtonProps = {
  icon: FontAwesomeIconProps['icon']
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
        <div className="flex w-full items-center justify-between rounded-lg border-1 border-default-200 bg-white p-4">
          <p className="text-xl font-semibold text-primary">{title}</p>
        </div>
      )}

      {React.Children.count(children) === 0 ? (
        <EmptyState add={addButton} />
      ) : null}

      <div className="flex w-full flex-col gap-2">{children}</div>

      {/* <Pagination /> */}
    </div>
  )
}
