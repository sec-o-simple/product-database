export default function PageContent({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col p-2 gap-4">{children}</div>
}

export function PageOutlet({ children }: { children: React.ReactNode }) {
  return <div className="p-4 flex-grow overflow-scroll">{children}</div>
}
