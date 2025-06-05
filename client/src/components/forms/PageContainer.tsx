export default function PageContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="
flex min-h-screen flex-col p-4 gap-4"
    >
      {children}
    </div>
  )
}
