import { describe, it, expect } from 'vitest'
import { useErrorLocalization } from '../src/utils/useErrorLocalization'

describe('useErrorLocalization', () => {
  it('should return false for isFieldInvalid when no error', () => {
    const { isFieldInvalid } = useErrorLocalization(null)
    expect(isFieldInvalid('testField')).toBe(false)
  })

  it('should return false for isFieldInvalid when no errors array', () => {
    const { isFieldInvalid } = useErrorLocalization({})
    expect(isFieldInvalid('testField')).toBe(false)
  })

  it('should return false for isFieldInvalid when field not found', () => {
    const error = {
      errors: [
        {
          name: 'validation_error',
          reason: 'Invalid value',
          more: { field: 'otherField', tag: 'required' },
        },
      ],
    }
    const { isFieldInvalid } = useErrorLocalization(error)
    expect(isFieldInvalid('testField')).toBe(false)
  })

  it('should return true for isFieldInvalid when field found', () => {
    const error = {
      errors: [
        {
          name: 'validation_error',
          reason: 'Invalid value',
          more: { field: 'testField', tag: 'required' },
        },
      ],
    }
    const { isFieldInvalid } = useErrorLocalization(error)
    expect(isFieldInvalid('testField')).toBe(true)
  })

  it('should return undefined for getFieldErrorMessage when field not found', () => {
    const error = {
      errors: [
        {
          name: 'validation_error',
          reason: 'Invalid value',
          more: { field: 'otherField', tag: 'required' },
        },
      ],
    }
    const { getFieldErrorMessage } = useErrorLocalization(error)
    expect(getFieldErrorMessage('testField')).toBeUndefined()
  })

  it('should return tag for getFieldErrorMessage when tag is available', () => {
    const error = {
      errors: [
        {
          name: 'validation_error',
          reason: 'Invalid value',
          more: { field: 'testField', tag: 'required' },
        },
      ],
    }
    const { getFieldErrorMessage } = useErrorLocalization(error)
    expect(getFieldErrorMessage('testField')).toBe('required')
  })

  it('should return reason for getFieldErrorMessage when tag is not available', () => {
    const error = {
      errors: [
        {
          name: 'validation_error',
          reason: 'Invalid value',
          more: { field: 'testField' },
        },
      ],
    }
    const { getFieldErrorMessage } = useErrorLocalization(error)
    expect(getFieldErrorMessage('testField')).toBe('Invalid value')
  })

  it('should handle null more object', () => {
    const error = {
      errors: [
        {
          name: 'validation_error',
          reason: 'Invalid value',
          more: null,
        },
      ],
    }
    const { isFieldInvalid, getFieldErrorMessage } = useErrorLocalization(error)
    expect(isFieldInvalid('testField')).toBe(false)
    expect(getFieldErrorMessage('testField')).toBeUndefined()
  })

  it('should handle errors without more field', () => {
    const error = {
      errors: [
        {
          name: 'validation_error',
          reason: 'Invalid value',
        },
      ],
    }
    const { isFieldInvalid, getFieldErrorMessage } = useErrorLocalization(error)
    expect(isFieldInvalid('testField')).toBe(false)
    expect(getFieldErrorMessage('testField')).toBeUndefined()
  })
})
