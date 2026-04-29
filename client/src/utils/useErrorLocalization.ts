interface ErrorMore {
  tag?: string
  field?: string | null
}

interface ErrorItem {
  name?: string | null
  reason?: string | null
  more?: ErrorMore | null
}

interface ErrorObject {
  errors?: (ErrorItem | null)[] | null
}

export const useErrorLocalization = (error: ErrorObject | null | undefined) => {
  const getErrorByFieldName = (fieldName: string): ErrorItem | undefined => {
    if (!error?.errors) return undefined

    return error.errors.find(
      (err): err is ErrorItem => !!err && err.more?.field == fieldName,
    )
  }

  const isFieldInvalid = (fieldName: string): boolean => {
    return !!getErrorByFieldName(fieldName)
  }

  const getFieldErrorMessage = (fieldName: string): string | undefined => {
    const fieldError = getErrorByFieldName(fieldName)
    if (!fieldError) return undefined

    // Return tag if available, otherwise return the reason
    return fieldError.more?.tag || fieldError.reason || undefined
  }

  return {
    isFieldInvalid,
    getFieldErrorMessage,
  }
}
