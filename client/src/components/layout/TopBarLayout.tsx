import { faArrowLeft, faDatabase } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/react'
import { Outlet, useNavigate } from 'react-router-dom'
import IconButton from '../forms/IconButton'
import { PageOutlet } from '../forms/PageContent'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useTranslation } from 'react-i18next'

interface TopBarProps {
  title?: string | React.ReactNode
  children?: React.ReactNode
  historyLink?: string
  navigateBack?: boolean
  backLink?: string
}

export function TopBar({
  title,
  children,
  navigateBack = true,
  backLink,
}: Readonly<TopBarProps>) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex w-full items-center justify-between gap-8 border-b bg-white px-6 py-4">
      <span className="flex items-center gap-2 text-2xl font-bold">
        <Tooltip content={t('goHome')} placement="bottom" showArrow>
          <Button
            isIconOnly
            variant="light"
            color="primary"
            radius="full"
            size="md"
            onPress={() => navigate('/')}
            href="/"
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
            onPress={() => (backLink ? navigate(backLink) : navigate(-1))}
          />
        )}

        {typeof title === 'string' ? <p>{title}</p> : title}
      </span>

      <div className="flex items-center gap-2">
        {/* {historyLink && (
          <Button
            variant="light"
            color="primary"
            href={historyLink}
            onPress={() => historyLink && navigate(historyLink)}
          >
            <FontAwesomeIcon icon={faHistory} size="lg" />
            History
          </Button>
        )} */}
        {children}
      </div>
    </div>
  )
}

export default function TopBarLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col bg-[#F9FAFB]">
      <TopBar title={t('title')} navigateBack={false}>
        <LanguageSwitcher />
      </TopBar>

      <PageOutlet>
        <Outlet />
      </PageOutlet>
    </div>
  )
}
