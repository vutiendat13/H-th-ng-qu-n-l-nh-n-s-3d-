const Toast = {
  icons: {
    success: '<i data-lucide="check-circle"></i>',
    error: '<i data-lucide="alert-circle"></i>',
    warning: '<i data-lucide="alert-triangle"></i>',
    info: '<i data-lucide="info"></i>'
  },
  
  show(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
      <div class="toast-icon">
        ${this.icons[type]}
      </div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <i data-lucide="x"></i>
      </button>
    `;
    
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons({ root: toast });
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    const closeBtn = toast.querySelector('.toast-close');
    
    const removeToast = () => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300); // match CSS transition
    };
    
    closeBtn.addEventListener('click', removeToast);
    
    if (duration > 0) {
      setTimeout(removeToast, duration);
    }
  },
  
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};
