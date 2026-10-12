document.addEventListener('DOMContentLoaded', () => {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const user = Auth.getUser();
  const currentPath = window.location.pathname;
  
  // Basic mapping for breadcrumbs
  const pathMap = {
    'dashboard.html': 'Tổng quan',
    'employees.html': 'Hồ sơ nhân sự',
    'employee-detail.html': 'Chi tiết nhân sự',
    'employee-form.html': 'Cập nhật nhân sự',
    'departments.html': 'Đơn vị / Phòng ban',
    'positions.html': 'Chức vụ',
    'education.html': 'Trình độ',
    'contracts.html': 'Hợp đồng',
    'work-history.html': 'Quá trình công tác',
    'rewards.html': 'Khen thưởng',
    'discipline.html': 'Kỷ luật',
    'leaves.html': 'Nghỉ phép',
    'users.html': 'Tài khoản',
    'roles.html': 'Phân quyền',
    'reports.html': 'Báo cáo',
    'settings.html': 'Cấu hình'
  };

  const pageName = currentPath.split('/').pop();
  const breadcrumbText = pathMap[pageName] || 'Trang';

  let topbarHTML = `
    <div class="topbar-left">
      <button class="toggle-sidebar-btn" id="toggle-sidebar">
        <i data-lucide="menu"></i>
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-item active">${breadcrumbText}</span>
      </div>
    </div>
    
    <div class="topbar-center">
      <div class="global-search">
        <i data-lucide="search" class="global-search-icon"></i>
        <input type="text" class="global-search-input" placeholder="Tìm kiếm nhân sự nhanh..." id="global-search-input">
      </div>
    </div>
    
    <div class="topbar-right">
      <button class="notification-btn" id="notification-btn">
        <i data-lucide="bell"></i>
        <span class="notification-badge hidden" id="notification-badge"></span>
      </button>
      
      <div class="user-menu" id="user-menu-btn">
        <div class="user-avatar">
          <img src="/assets/avatar-default.svg" alt="Avatar">
        </div>
        <div class="user-info">
          <span class="user-name">${user ? user.username : 'User'}</span>
          <span class="user-role">${user ? user.role : ''}</span>
        </div>
        <i data-lucide="chevron-down" style="width:16px;height:16px;color:var(--color-text-muted)"></i>
      </div>
      
      <div class="dropdown-menu" id="user-dropdown">
        <div class="dropdown-item" id="logout-btn">
          <i data-lucide="log-out"></i>
          <span>Đăng xuất</span>
        </div>
      </div>
    </div>
  `;

  topbar.innerHTML = topbarHTML;
  if (window.lucide) lucide.createIcons({ root: topbar });

  // Sidebar toggle
  const toggleBtn = document.getElementById('toggle-sidebar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
    });
  }

  // User menu dropdown
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
  }
  
  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.logout();
    });
  }

  // Global search quick redirect
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `/pages/employees.html?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  // Check notifications (expiring contracts)
  checkNotifications();
});

async function checkNotifications() {
  try {
    const res = await api.get('/dashboard/contract-expiring');
    if (res.success && res.data && res.data.length > 0) {
      const badge = document.getElementById('notification-badge');
      if (badge) badge.classList.remove('hidden');
    }
  } catch (e) {
    console.error('Failed to load notifications', e);
  }
}
