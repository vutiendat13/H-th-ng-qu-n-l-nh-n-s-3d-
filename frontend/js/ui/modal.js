const Modal = {
  activeModal: null,

  init() {
    let container = document.getElementById('modal-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-container';
      
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.addEventListener('click', () => {
        if (this.activeModal && !this.activeModal.preventClose) {
          this.hide();
        }
      });
      
      container.appendChild(backdrop);
      document.body.appendChild(container);
    }
  },

  show(options) {
    this.init();
    
    const { title, content, size = '', onConfirm, onClose, preventClose = false, hideFooter = false, confirmText = 'Lưu', cancelText = 'Hủy', confirmClass = 'btn-primary' } = options;
    
    const container = document.getElementById('modal-container');
    
    // Remove existing modal if any
    const existingModal = container.querySelector('.modal');
    if (existingModal) {
      container.removeChild(existingModal);
    }
    
    const modal = document.createElement('div');
    modal.className = `modal ${size}`;
    
    let footerHTML = '';
    if (!hideFooter) {
      footerHTML = `
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-btn-cancel">${cancelText}</button>
          <button type="button" class="btn ${confirmClass} modal-btn-confirm">${confirmText}</button>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button type="button" class="modal-close">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${footerHTML}
    `;
    
    container.appendChild(modal);
    if (window.lucide) lucide.createIcons({ root: modal });
    
    this.activeModal = {
      modal,
      preventClose,
      onClose
    };
    
    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => this.hide());
    
    if (!hideFooter) {
      modal.querySelector('.modal-btn-cancel').addEventListener('click', () => this.hide());
      modal.querySelector('.modal-btn-confirm').addEventListener('click', async () => {
        if (onConfirm) {
          const btn = modal.querySelector('.modal-btn-confirm');
          const originalText = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Đang xử lý...';
          if (window.lucide) lucide.createIcons({ root: btn });
          
          try {
            await onConfirm();
          } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
          }
        }
      });
    }
    
    // Show modal
    setTimeout(() => {
      container.classList.add('active');
    }, 10);
  },

  hide() {
    const container = document.getElementById('modal-container');
    if (container) {
      container.classList.remove('active');
      if (this.activeModal && this.activeModal.onClose) {
        this.activeModal.onClose();
      }
      setTimeout(() => {
        const modal = container.querySelector('.modal');
        if (modal) {
          container.removeChild(modal);
        }
        this.activeModal = null;
      }, 200); // Wait for transition
    }
  }
};
