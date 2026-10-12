document.addEventListener('DOMContentLoaded', () => {
  // Only redirect if not on login page
  const isLoginPage = window.location.pathname.includes('login.html');
  
  if (!isLoginPage) {
    if (!Auth.requireAuth()) return;
  }
  
  // Initialize Lucide icons if available
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Setup global error handling for fetch/promises
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.Toast && event.reason && event.reason.message && event.reason.message !== 'Unauthorized') {
      Toast.error(event.reason.message);
    }
  });

  // Apply user role constraints on UI elements
  applyRoleConstraints();
});

function applyRoleConstraints() {
  const user = Auth.getUser();
  if (!user) return;
  
  const role = user.role;
  
  // Elements that require specific roles
  document.querySelectorAll('[data-role]').forEach(el => {
    const requiredRoles = el.getAttribute('data-role').split(',');
    if (!requiredRoles.includes(role)) {
      el.classList.add('hidden');
    }
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
