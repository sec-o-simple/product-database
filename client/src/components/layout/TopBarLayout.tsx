import {
  faArrowLeft,
  faDatabase,
  faHistory,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/react'
import { Outlet, useNavigate } from 'react-router-dom'
import IconButton from '../forms/IconButton'

interface TopBarProps {
  title?: string | React.ReactNode
  children?: React.ReactNode
  historyLink?: string
  navigateBack?: boolean
}

export function TopBar({
  title,
  children,
  historyLink,
  navigateBack = true,
}: Readonly<TopBarProps>) {
  const navigate = useNavigate()

  return (
    <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
      <span className="flex items-center gap-2 text-2xl font-bold">
        <Tooltip content="Go to Home" placement="bottom" showArrow>
          <Button
            isIconOnly
            variant="light"
            color="primary"
            radius="full"
            size="md"
            onPress={() => navigate('/')}
          >
            <FontAwesomeIcon icon={faDatabase} size="lg" />
          </Button>
        </Tooltip>

        {navigateBack && (
          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
        )}

        {typeof title === 'string' ? <p>{title}</p> : title}
      </span>

      <div className="flex items-center gap-2">
        {historyLink && (
          <Button
            variant="light"
            color="primary"
            href={historyLink}
            onPress={() => historyLink && navigate(historyLink)}
          >
            <FontAwesomeIcon icon={faHistory} size="lg" />
            History
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}

export default function TopBarLayout() {
  return (
    <div className="flex h-screen flex-col bg-[#F9FAFB]">
      <TopBar title="Product Database" navigateBack={false} />

      <div className="p-4">
        <Outlet />
      </div>
    </div>
  )
}
