import Swal from 'sweetalert2';

export const showSuccess = (message, title = 'Thành công') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#52c41a',
    timer: 3000,
    timerProgressBar: true
  });
};

export const showError = (message, title = 'Lỗi') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ff4d4f'
  });
};

export const showConfirm = (message, title = 'Xác nhận') => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#ff4d4f',
    cancelButtonColor: '#8c8c8c',
    reverseButtons: true
  });
};

