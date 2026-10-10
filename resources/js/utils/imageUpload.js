import Swal from 'sweetalert2';

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export function isImageTooLarge(file) {
    return file.size > MAX_IMAGE_SIZE_BYTES;
}

export function showImageSizeWarning() {
    return Swal.fire({
        icon: 'warning',
        title: 'Ukuran gambar terlalu besar',
        text: 'Gagal mengunggah. Ukuran gambar melebihi batas maksimal 2 MB.',
    });
}

export function showImageUploadError(message) {
    return Swal.fire({
        icon: 'error',
        title: 'Gagal mengunggah gambar',
        text: message,
    });
}
