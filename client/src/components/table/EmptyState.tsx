import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'

export function EmptyState({ add }: { add?: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-gray-100 text-4xl">
        <FontAwesomeIcon icon={faFolderOpen} className="text-zinc-400" />
      </div>
      <h3 className="mt-2 font-semibold text-slate-500">
        {t('common.emptyState.title')}
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        {t('common.emptyState.description')}
      </p>
      {add && <div className="mt-6">{add}</div>}
    </div>
  )
}
