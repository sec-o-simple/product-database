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

  return {
    location,
    navigate,
    goBack,
    state,
    params,
  }
}
