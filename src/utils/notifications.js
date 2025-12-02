import Swal from 'sweetalert2';

// Success notification
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

// Error notification
export const showError = (message, title = 'Lỗi') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ff4d4f'
  });
};

// Warning notification
export const showWarning = (message, title = 'Cảnh báo') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#faad14'
  });
};

// Info notification
export const showInfo = (message, title = 'Thông tin') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#1890ff'
  });
};

// Confirm dialog
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

// Delete confirmation
export const showDeleteConfirm = (itemName = 'mục này') => {
  return Swal.fire({
    icon: 'warning',
    title: 'Xác nhận xóa',
    html: `Bạn có chắc chắn muốn xóa <strong>${itemName}</strong>?<br/><small>Hành động này không thể hoàn tác!</small>`,
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#ff4d4f',
    cancelButtonColor: '#8c8c8c',
    reverseButtons: true
  });
};

