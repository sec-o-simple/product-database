import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'

export default function History() {
  const navigate = useNavigate()

  return (
    <Button
      variant="light"
      color="primary"
      onPress={() => navigate('/products/1/history')}
    >
      <FontAwesomeIcon icon={faClockRotateLeft} />
      History
    </Button>
  )
}
