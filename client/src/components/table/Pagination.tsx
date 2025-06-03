import { Pagination as HPagination } from '@heroui/pagination'
import { Select, SelectItem } from '@heroui/select'
import { cn } from '@heroui/theme'
import { useState } from 'react'

export default function Pagination({
  classNames,
}: {
  classNames?: {
    base?: string
  }
}) {
  const [entries, setEntries] = useState('10')

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between bg-white p-4 rounded-lg border border-gray-200',
        classNames?.base,
      )}
    >
      <div className="flex gap-2 items-center">
        <p>Show</p>
        <Select
          variant="bordered"
          className="w-36"
          classNames={{
            trigger: 'border-1 shadow-none',
          }}
          selectedKeys={entries}
          selectionMode="single"
          onSelectionChange={(key) => {
            setEntries(key as string)
          }}
        >
          <SelectItem key="10">10 entries</SelectItem>
          <SelectItem key="20">20 entries</SelectItem>
          <SelectItem key="50">50 entries</SelectItem>
        </Select>
      </div>

      <div className="flex gap-4 items-center">
        <p>Showing 1 - 10 of 100 results</p>
        <HPagination
          isCompact
          showControls
          initialPage={1}
          variant="light"
          total={10}
          classNames={{
            ellipsis: 'rounded-medium',
            item: 'rounded-lg',
            wrapper: 'shadow-none',
          }}
        />
      </div>
    </div>
  )
}
