import client from '@/client'
import { faFileExport } from '@fortawesome/free-solid-svg-icons'
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome'
import { Button, ButtonProps } from '@heroui/button'
import { addToast } from '@heroui/react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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

export const SelectableContext = React.createContext<{
  selectable: boolean
  toggleSelectable: () => void
  selected: string[]
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
}>({
  selectable: false,
  toggleSelectable: () => {},
  selected: [],
  setSelected: () => {},
})

function useExportProductTree() {
  const { t } = useTranslation()

  return client.useMutation('get', '/api/v1/products/export', {
    onSuccess: (response) => {
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `product_tree_export_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      console.log('Export successful')
    },
    onError: (error) => {
      addToast({
        title: t('error.export.title'),
        description: error?.title || t('error.export.text'),
        color: 'danger',
      })
    },
  })
}

export default function DataGrid({
  title,
  actions,
  exportable = false,
  addButton,
  children,
}: {
  title?: string
  actions?: React.ReactNode
  exportable?: boolean
  addButton?: React.ReactNode
  children: React.ReactNode[] | React.ReactNode | undefined
}) {
  const [selected, setSelected] = React.useState<string[]>([])
  const [selectable, setSelectable] = React.useState<boolean>(false)
  const toggleSelectable = () => {
    setSelectable(!selectable)
    setSelected([])
  }

  const exportMutation = useExportProductTree()

  const onExportClick = useCallback(() => {
    exportMutation.mutate({
      params: {
        query: { ids: selected.join(',') },
      },
    })
  }, [exportMutation, selected])

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {title && (
        <div className="flex w-full items-center justify-between rounded-lg border-1 border-default-200 bg-white p-4">
          <p className="text-xl font-semibold text-primary">{title}</p>

          {actions && <div className="flex items-center">{actions}</div>}
        </div>
      )}

      {exportable && (
        <div className="flex w-full items-center justify-end gap-2">
          {selectable ? (
            <>
              <Button variant="light" color="danger" onPress={toggleSelectable}>
                Stop Selection
              </Button>

              <Button
                color="primary"
                onPress={onExportClick}
                isDisabled={selected.length === 0}
              >
                <FontAwesomeIcon icon={faFileExport} />
                Export Selected ({selected.length})
              </Button>
            </>
          ) : (
            <Button variant="light" color="primary" onPress={toggleSelectable}>
              Select for Export
            </Button>
          )}
        </div>
      )}

      {React.Children.count(children) === 0 ? (
        <EmptyState add={addButton} />
      ) : null}

      <SelectableContext.Provider
        value={{
          selectable,
          toggleSelectable: () => {
            setSelectable(!selectable)
            setSelected([])
          },
          selected,
          setSelected,
        }}
      >
        <div className="flex w-full flex-col gap-2">{children}</div>
      </SelectableContext.Provider>

      {/* <Pagination /> */}
    </div>
  )
}
