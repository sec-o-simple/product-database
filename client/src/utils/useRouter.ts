import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function useRouter() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams<{
    [key: string]: string | undefined
  }>()
  const state = location.state as { backgroundLocation?: Location }

  const goBack = () => {
    if (state?.backgroundLocation) {
      navigate(state.backgroundLocation)
    } else {
      navigate(-1)
    }
  }

  const navigateToModal = (href: string, returnTo?: string) => {
    navigate(href, {
      state: {
        backgroundLocation: location,
        returnTo: returnTo || undefined,
      },
    })
  }

  return {
    location,
    navigate,
    navigateToModal,
    goBack,
    state,
    params,
  }
}
