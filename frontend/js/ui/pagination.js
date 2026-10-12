class Pagination {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.onPageChange = options.onPageChange || (() => {});
  }

  render(currentPage, totalPages, totalItems) {
    if (!this.container) return;
    
    if (totalPages <= 1) {
      this.container.innerHTML = '';
      return;
    }

    let html = `<div class="pagination">`;
    
    if (totalItems !== undefined) {
      html += `<div class="pagination-info">Tổng: ${totalItems}</div>`;
    }

    // Prev
    html += `
      <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
        <i data-lucide="chevron-left"></i>
      </button>
    `;

    // Pages
    for (let i = 1; i <= totalPages; i++) {
      // Simple logic: show first, last, current, and +-1
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        html += `
          <button class="page-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">
            ${i}
          </button>
        `;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        html += `<span style="color: var(--color-text-muted)">...</span>`;
      }
    }

    // Next
    html += `
      <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
        <i data-lucide="chevron-right"></i>
      </button>
    </div>`;

    this.container.innerHTML = html;
    
    if (window.lucide) {
      lucide.createIcons({ root: this.container });
    }

    // Bind events
    const btns = this.container.querySelectorAll('.page-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled && !btn.classList.contains('active')) {
          const page = parseInt(btn.getAttribute('data-page'));
          this.onPageChange(page);
        }
      });
    });
  }
}
