export default function PageContent({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col gap-4 p-2">{children}</div>
}

export function PageOutlet({ children }: { children: React.ReactNode }) {
  return <div className="grow overflow-scroll p-4">{children}</div>
}
