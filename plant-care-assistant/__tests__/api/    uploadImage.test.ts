import { validateFileExtension } from '@utils/validateFileExtension'

describe('Image extension validation', () => {
  it('should allow valid image extensions', () => {
    expect(validateFileExtension('image.png')).toBe(true)
    expect(validateFileExtension('photo.WEBP')).toBe(true)
    expect(validateFileExtension('photo.webp')).toBe(true)
    expect(validateFileExtension('cat.jpg')).toBe(true)
    expect(validateFileExtension('file.jpeg')).toBe(true)
  })

  it('should reject invalid image extensions', () => {
    expect(validateFileExtension('image.gif')).toBe(false)
    expect(validateFileExtension('doc.txt')).toBe(false)
    expect(validateFileExtension('video.mp3')).toBe(false)
    expect(validateFileExtension('video.mp4')).toBe(false)
    expect(validateFileExtension('archive.zip')).toBe(false)
    expect(validateFileExtension('image.bmp')).toBe(false)
    expect(validateFileExtension('image.tiff')).toBe(false)
    expect(validateFileExtension('image.svg')).toBe(false)

  })
})
    