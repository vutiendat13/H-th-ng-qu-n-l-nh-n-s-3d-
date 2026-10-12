document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  
  if (Auth.isAuthenticated()) {
    window.location.href = '/pages/dashboard.html';
    return;
  }
  
  const form = document.getElementById('login-form');
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');
  
  // Show/Hide password
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      const icon = type === 'password' ? 'eye' : 'eye-off';
      togglePassword.setAttribute('data-lucide', icon);
      if (window.lucide) lucide.createIcons({ root: togglePassword.parentElement });
    });
  }
  
  // Handle submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value.trim();
      const password = passwordInput.value;
      
      if (!username || !password) {
        Toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
        return;
      }
      
      // Loading state
      submitBtn.disabled = true;
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Đang đăng nhập...';
      if (window.lucide) lucide.createIcons({ root: submitBtn });
      
      try {
        const result = await Auth.login(username, password);
        if (result.success) {
          Toast.success('Đăng nhập thành công');
          setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
          }, 500);
        } else {
          Toast.error(result.message || 'Đăng nhập thất bại');
        }
      } catch (error) {
        Toast.error(error.message || 'Có lỗi xảy ra khi kết nối đến máy chủ');
      } finally {
        if (!Auth.isAuthenticated()) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }
      }
    });
  }
});
