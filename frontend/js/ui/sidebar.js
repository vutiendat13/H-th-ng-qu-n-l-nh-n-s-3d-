const navConfig = [
  {
    group: 'TỔNG QUAN',
    items: [
      { icon: 'layout-dashboard', text: 'Dashboard', href: '/pages/dashboard.html' }
    ]
  },
  {
    group: 'NHÂN SỰ',
    items: [
      { icon: 'users', text: 'Hồ sơ nhân sự', href: '/pages/employees.html' },
      { icon: 'building-2', text: 'Đơn vị / Phòng ban', href: '/pages/departments.html' },
      { icon: 'briefcase', text: 'Chức vụ', href: '/pages/positions.html' },
      { icon: 'graduation-cap', text: 'Trình độ', href: '/pages/education.html' },
      { icon: 'history', text: 'Quá trình công tác', href: '/pages/work-history.html' }
    ]
  },
  {
    group: 'LAO ĐỘNG',
    items: [
      { icon: 'file-text', text: 'Hợp đồng', href: '/pages/contracts.html' },
      { icon: 'calendar-off', text: 'Nghỉ phép', href: '/pages/leaves.html' }
    ]
  },
  {
    group: 'KHEN THƯỞNG',
    items: [
      { icon: 'star', text: 'Khen thưởng', href: '/pages/rewards.html' },
      { icon: 'alert-triangle', text: 'Kỷ luật', href: '/pages/discipline.html' }
    ]
  },
  {
    group: 'HỆ THỐNG',
    items: [
      { icon: 'user-cog', text: 'Tài khoản', href: '/pages/users.html', adminOnly: true },
      { icon: 'shield', text: 'Phân quyền', href: '/pages/roles.html', adminOnly: true },
      { icon: 'settings', text: 'Cấu hình', href: '/pages/settings.html', adminOnly: true }
    ]
  },
  {
    group: 'BÁO CÁO',
    items: [
      { icon: 'bar-chart-2', text: 'Báo cáo', href: '/pages/reports.html' }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const currentPath = window.location.pathname;
  const user = Auth.getUser();
  const isAdmin = Auth.isAdmin();

  let sidebarHTML = `
    <div class="sidebar-header">
      <a href="/pages/dashboard.html" class="sidebar-logo">
        <img src="/assets/logo.svg" alt="Logo">
        <span>HDP-HRMS</span>
      </a>
    </div>
    <div class="sidebar-content">
  `;

  navConfig.forEach(group => {
    // Filter items based on role
    const items = group.items.filter(item => !item.adminOnly || isAdmin);
    
    if (items.length > 0) {
      sidebarHTML += `
        <div class="nav-group">
          <div class="nav-group-label">${group.group}</div>
      `;
      
      items.forEach(item => {
        // Simple active matching
        const isActive = currentPath.includes(item.href) || 
                         (item.href === '/pages/employees.html' && currentPath.includes('employee-detail')) ||
                         (item.href === '/pages/employees.html' && currentPath.includes('employee-form'));
        const activeClass = isActive ? 'active' : '';
        
        sidebarHTML += `
          <a href="${item.href}" class="nav-item ${activeClass}" title="${item.text}">
            <i data-lucide="${item.icon}"></i>
            <span>${item.text}</span>
          </a>
        `;
      });
      
      sidebarHTML += `</div>`;
    }
  });

  sidebarHTML += `</div>`;
  sidebar.innerHTML = sidebarHTML;

  if (window.lucide) {
    lucide.createIcons({ root: sidebar });
  }

  // Handle collapsed tooltips logic if needed later
});
