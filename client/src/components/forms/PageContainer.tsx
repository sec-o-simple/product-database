export default function PageContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex h-screen flex-col bg-[#F9FAFB]">{children}</div>
}
