import { describe, expect, it } from 'vitest'
import {
  getIdentificationHelperValidationError,
  hasEnteredIdentificationHelperData,
  isValidCpeString,
  isValidGenericUri,
  isValidHttpUrl,
  isValidIdentificationHelperData,
  isValidPurlString,
} from '@/routes/IdentificationHelper/CreateIDHelper'
import { idHelperTypes } from '@/routes/IdentificationHelper/IdentificationOverview'

describe('CreateIDHelper validation utilities', () => {
  const mockT = (key: string) => key

  it('validates HTTP/HTTPS URLs', () => {
    expect(isValidHttpUrl('https://example.com/sbom.json')).toBe(true)
    expect(isValidHttpUrl('http://example.com')).toBe(true)
    expect(isValidHttpUrl('ftp://example.com')).toBe(false)
    expect(isValidHttpUrl('not-a-url')).toBe(false)
  })

  it('validates generic URIs', () => {
    expect(isValidGenericUri('urn:uuid:123e4567-e89b-12d3-a456-426614174000')).toBe(
      true,
    )
    expect(isValidGenericUri('mailto:security@example.com')).toBe(true)
    expect(isValidGenericUri('https://example.com/resource')).toBe(true)
    expect(isValidGenericUri('example.com/resource')).toBe(false)
  })

  it('validates purl strings', () => {
    expect(isValidPurlString('pkg:npm/lodash@4.17.21')).toBe(true)
    expect(
      isValidPurlString('pkg:maven/org.apache.commons/commons-lang3@3.14.0'),
    ).toBe(true)
    expect(isValidPurlString('pkg:/missing-type')).toBe(false)
    expect(isValidPurlString('lodash@4.17.21')).toBe(false)
  })

  it('validates cpe strings', () => {
    expect(
      isValidCpeString('cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*'),
    ).toBe(true)
    expect(isValidCpeString('cpe:/a:vendor:product:1.0')).toBe(true)
    expect(isValidCpeString('cpe:2.3:a:vendor:product')).toBe(false)
    expect(isValidCpeString('invalid-cpe')).toBe(false)
  })

  it('validates SBOM URLs using helper data validation', () => {
    const sbomType = idHelperTypes.find((t) => t.id === 'sbom')
    expect(sbomType).toBeTruthy()

    expect(
      isValidIdentificationHelperData(sbomType!, {
        sbom_urls: ['https://example.com/sbom.json'],
      }),
    ).toBe(true)

    expect(
      isValidIdentificationHelperData(sbomType!, {
        sbom_urls: ['https://example.com/sbom.json', 'invalid-url'],
      }),
    ).toBe(false)
  })

  it('validates generic URI helper rows are complete and valid', () => {
    const uriType = idHelperTypes.find((t) => t.id === 'uri')
    expect(uriType).toBeTruthy()

    expect(
      isValidIdentificationHelperData(uriType!, {
        uris: [{ namespace: 'prod', uri: 'urn:uuid:123e4567-e89b-12d3-a456-426614174000' }],
      }),
    ).toBe(true)

    expect(
      isValidIdentificationHelperData(uriType!, {
        uris: [{ namespace: 'prod', uri: '' }],
      }),
    ).toBe(false)

    expect(
      isValidIdentificationHelperData(uriType!, {
        uris: [
          { namespace: 'prod', uri: 'urn:uuid:123e4567-e89b-12d3-a456-426614174000' },
          { namespace: '', uri: 'https://example.com/resource' },
        ],
      }),
    ).toBe(false)
  })

  it('validates CPE helper data through unified validation', () => {
    const cpeType = idHelperTypes.find((t) => t.id === 'cpe')
    expect(cpeType).toBeTruthy()

    expect(
      isValidIdentificationHelperData(cpeType!, {
        cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*',
      }),
    ).toBe(true)

    expect(
      isValidIdentificationHelperData(cpeType!, {
        cpe: 'cpe:2.3:a:vendor:product',
      }),
    ).toBe(false)
  })

  it('detects whether user has entered helper data', () => {
    const cpeType = idHelperTypes.find((t) => t.id === 'cpe')
    expect(cpeType).toBeTruthy()

    expect(
      hasEnteredIdentificationHelperData(cpeType!, {
        cpe: '',
      }),
    ).toBe(false)

    expect(
      hasEnteredIdentificationHelperData(cpeType!, {
        cpe: 'cpe:2.3:a:vendor:product',
      }),
    ).toBe(true)
  })

  it('returns validation message for invalid CPE after data entry', () => {
    const cpeType = idHelperTypes.find((t) => t.id === 'cpe')
    expect(cpeType).toBeTruthy()

    expect(
      getIdentificationHelperValidationError(
        cpeType!,
        { cpe: 'cpe:2.3:a:vendor:product' },
        mockT,
      ),
    ).toBe('identificationHelper.validation.invalidCpe')
  })

  it('does not return validation message when no value was entered', () => {
    const purlType = idHelperTypes.find((t) => t.id === 'purl')
    expect(purlType).toBeTruthy()

    expect(
      getIdentificationHelperValidationError(purlType!, { purl: '' }, mockT),
    ).toBeNull()
  })

  it('returns URI-specific validation message for incomplete rows', () => {
    const uriType = idHelperTypes.find((t) => t.id === 'uri')
    expect(uriType).toBeTruthy()

    expect(
      getIdentificationHelperValidationError(
        uriType!,
        { uris: [{ namespace: 'prod', uri: '' }] },
        mockT,
      ),
    ).toBe('identificationHelper.validation.incompleteUri')
  })
})
