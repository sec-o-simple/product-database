import { PropsWithChildren, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router'
import { NavLink } from 'react-router-dom'

export default function NavigationLayout() {
  return (
    <div className="flex grow">
      <div className="flex basis-80 flex-col gap-2 border-r border-neutral-200 p-4">
        <Section
          number={1}
          title="Document Information"
          to="/document-information"
        >
          <SubSection title="General" to="/document-information/general" />
          <SubSection title="Notes" to="/document-information/notes" />
          <SubSection title="Publisher" to="/document-information/publisher" />
          <SubSection
            title="References"
            to="/document-information/references"
          />
        </Section>
        <Section number={2} title="Products" to="/products" />
        <Section number={3} title="Vulnerabilities" to="/vulnerabilities" />
      </div>
      <div className="grow bg-content2">
        <Outlet />
      </div>
    </div>
  )
}

function Section({
  number,
  title,
  to,
  children,
}: PropsWithChildren<{
  number: number
  title: string
  to: string
}>) {
  const location = useLocation()
  const isActive = useMemo(
    () => location.pathname.startsWith(to),
    [location.pathname, to],
  )

  return (
    <div className="flex flex-col gap-2 text-neutral-foreground">
      <NavLink
        to={to}
        className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-content2 ${
          isActive ? 'bg-content2 font-semibold text-foreground' : ''
        }`}
      >
        <div
          className={`flex size-8 items-center justify-center rounded-full bg-content3 p-4 ${
            isActive ? 'bg-primary text-primary-foreground' : ''
          }`}
        >
          {number}
        </div>
        {title}
      </NavLink>
      {children}
    </div>
  )
}

function SubSection({ title, to }: { title: string; to: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }: { isActive: boolean }) =>
        `cursor-pointer pl-12 transition-colors hover:text-primary ${
          isActive ? 'text-primary font-bold' : ''
        }`
      }
    >
      {title}
    </NavLink>
  )
}
