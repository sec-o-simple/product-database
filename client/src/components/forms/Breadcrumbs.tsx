import { Breadcrumbs as MuiBreadcrumbs } from '@heroui/react'

export default function Breadcrumbs({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MuiBreadcrumbs
      radius="lg"
      variant="solid"
      classNames={{
        list: 'bg-white border-1 border-default-200',
      }}
    >
      {children}
    </MuiBreadcrumbs>
  )
}
