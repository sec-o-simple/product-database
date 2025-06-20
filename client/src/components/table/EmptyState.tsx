import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function EmptyState({ add }: { add?: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-24 h-24 text-4xl rounded-full bg-gray-100 flex items-center justify-center">
        <FontAwesomeIcon icon={faFolderOpen} className="text-zinc-400" />
      </div>
      <h3 className="mt-2 font-semibold text-gray-900">No Data Available</h3>
      <p className="mt-1 text-sm text-gray-500">
        There are no items to display at this moment.
      </p>
      {add && <div className="mt-6">{add}</div>}
    </div>
  )
}
