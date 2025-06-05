const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

export function validateFileExtension(fileName: string): boolean {
    const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    return allowedExtensions.includes(`.${fileExtension}`);
}