export default function PageContent({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col p-2 gap-4">{children}</div>
}
