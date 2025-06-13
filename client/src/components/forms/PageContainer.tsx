export default function PageContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col bg-[#F9FAFB] h-screen">{children}</div>
}
