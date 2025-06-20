import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useRefetchQuery(request: any) {
  const location = useLocation()
  useEffect(() => {
    if (location.state && location.state.shouldRefetch) {
      request.refetch()
    }
  }, [location])
}
