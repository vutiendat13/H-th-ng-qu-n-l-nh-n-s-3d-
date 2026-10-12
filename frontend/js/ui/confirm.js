const Confirm = {
  show(options) {
    return new Promise((resolve, reject) => {
      const {
        title = 'Xác nhận',
        message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
        confirmText = 'Đồng ý',
        cancelText = 'Hủy',
        type = 'danger' // primary, danger
      } = options;
      
      const confirmClass = type === 'danger' ? 'btn-danger' : 'btn-primary';
      const icon = type === 'danger' 
        ? '<div style="color:var(--color-error); margin-bottom: 16px; text-align: center;"><i data-lucide="alert-triangle" style="width:48px;height:48px;"></i></div>'
        : '';
        
      Modal.show({
        title,
        size: 'modal-sm',
        content: `
          ${icon}
          <p style="text-align: center; margin: 0; font-size: 15px;">${message}</p>
        `,
        confirmText,
        cancelText,
        confirmClass,
        onConfirm: async () => {
          if (options.onConfirm) {
            await options.onConfirm();
          }
          Modal.hide();
          resolve(true);
        },
        onClose: () => {
          resolve(false);
        }
      });
    });
  }
};
