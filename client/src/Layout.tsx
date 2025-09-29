import { addToast } from '@heroui/react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import useRouter from './utils/useRouter'

export default function Layout() {
  const { state } = useLocation()
  const { navigate, location } = useRouter()

  useEffect(() => {
    if (state?.message) {
      addToast({
        title: state.message,
        color: state.type || 'default',
      })
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [state, navigate, location.pathname])

  return <Outlet />
}
