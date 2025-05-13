import { EmptyState } from '@/routes/Vendor'
import React from 'react'
import Pagination from '../table/Pagination'

export default function DataGrid({
  title,
  addButton,
  children,
}: {
  title: string
  addButton?: React.ReactNode
  children: React.ReactNode[] | React.ReactNode | undefined
}) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between border-1 border-gray-200 bg-white p-4 rounded-md">
        <p className="font-semibold text-xl text-primary">{title}</p>
      </div>

      {/** Empty State */}
      {!children && <EmptyState add={addButton} />}

      <div className="flex flex-col w-full gap-2">{children}</div>

      <Pagination />
    </div>
  )
}
