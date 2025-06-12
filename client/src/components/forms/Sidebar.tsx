export default function Sidebar({
  children,
  attributes,
  actions,
}: {
  attributes?: React.ReactNode[] | React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
      <div className="flex flex-col flex-grow justify-between">
        <div className="flex flex-col gap-4">
          {Array.isArray(attributes)
            ? attributes.map((attribute, index) => (
                <div key={`attribute-${index}`}>{attribute}</div>
              ))
            : attributes}

          {children}
        </div>

        {/* {actions} */}
      </div>
    </div>
  )
}
