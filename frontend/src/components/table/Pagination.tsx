import { Pagination as HPagination } from '@heroui/pagination'

export default function Pagination() {
  return (
    <div className="flex w-full items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
      <p>Show: 10 entries</p>

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
