import { addToast } from '@heroui/react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import useRouter from './utils/useRouter'

export default function Layout() {
  const { state } = useLocation()
  const { navigate } = useRouter()

  useEffect(() => {
    if (state?.message) {
      addToast({
        title: state.message,
        color: state.type || 'default',
      })
      navigate('', { replace: true, state: {} })
    }
  }, [state, navigate])

  return <Outlet />
}
