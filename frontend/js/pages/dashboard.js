document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  try {
    // Fire API calls concurrently
    const [summaryRes, trendRes, deptRes, newEmpRes, activityRes] = await Promise.allSettled([
      api.get('/dashboard/summary'),
      api.get('/dashboard/employee-stats'),
      api.get('/dashboard/department-stats'),
      api.get('/dashboard/new-employees'),
      api.get('/dashboard/recent-activity')
    ]);

    // Handle Summary
    if (summaryRes.status === 'fulfilled' && summaryRes.value.success) {
      const data = summaryRes.value.data;
      document.getElementById('kpi-total').textContent = data.total_employees;
      document.getElementById('kpi-active').textContent = data.active_employees;
      document.getElementById('kpi-leave').textContent = data.on_leave_employees;
      document.getElementById('kpi-expiring').textContent = data.expiring_contracts;
      document.getElementById('kpi-new').textContent = data.new_this_month;
    }

    // Handle Trend Chart
    if (trendRes.status === 'fulfilled' && trendRes.value.success) {
      initTrendChart(trendRes.value.data);
    }

    // Handle Dept Chart
    if (deptRes.status === 'fulfilled' && deptRes.value.success) {
      initDeptChart(deptRes.value.data);
    }

    // Handle New Employees Table
    if (newEmpRes.status === 'fulfilled' && newEmpRes.value.success) {
      renderNewEmployees(newEmpRes.value.data);
    }

    // Handle Recent Activity
    if (activityRes.status === 'fulfilled' && activityRes.value.success) {
      renderActivity(activityRes.value.data);
    }

  } catch (error) {
    console.error('Error loading dashboard data', error);
  }
});

function initTrendChart(data) {
  const ctx = document.getElementById('employeeTrendChart');
  if (!ctx || !data) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Tuyển mới',
          data: data.new_hires,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Nghỉ việc',
          data: data.resigned,
          borderColor: '#dc2626',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function initDeptChart(data) {
  const ctx = document.getElementById('deptDistributionChart');
  if (!ctx || !data || data.length === 0) return;

  const labels = data.map(d => d.department);
  const values = data.map(d => d.count);
  
  const colors = [
    '#1e3a5f', '#0ea5e9', '#0284c7', '#38bdf8', '#7dd3fc', 
    '#0f172a', '#334155', '#475569', '#64748b'
  ];

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12 } }
      },
      cutout: '65%'
    }
  });
}

function renderNewEmployees(data) {
  const tbody = document.getElementById('new-employees-table');
  if (!tbody) return;
  
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Không có nhân sự mới</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map(emp => `
    <tr>
      <td><span class="font-medium">${emp.code}</span></td>
      <td>${emp.full_name}</td>
      <td>${emp.department || '-'}</td>
      <td>${formatDate(emp.hire_date)}</td>
    </tr>
  `).join('');
}

function renderActivity(data) {
  const container = document.getElementById('recent-activity-list');
  if (!container) return;
  
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="text-center text-muted py-4">Không có hoạt động nào</div>';
    return;
  }
  
  const getIcon = (action) => {
    switch(action.toLowerCase()) {
      case 'create': return 'plus';
      case 'update': return 'edit-2';
      case 'delete': return 'trash-2';
      case 'approve': return 'check';
      default: return 'activity';
    }
  };
  
  container.innerHTML = data.map(act => `
    <div class="activity-item">
      <div class="activity-icon"><i data-lucide="${getIcon(act.action)}"></i></div>
      <div class="activity-content">
        <div class="activity-text">
          <strong>${act.user}</strong> đã ${translateAction(act.action)} 
          ${translateResource(act.resource)} 
          ${act.details ? `(<em>${act.details}</em>)` : ''}
        </div>
        <div class="activity-time">${formatDate(act.created_at)}</div>
      </div>
    </div>
  `).join('');
  
  if (window.lucide) lucide.createIcons({ root: container });
}

function translateAction(action) {
  const map = { create: 'thêm mới', update: 'cập nhật', delete: 'xóa', approve: 'phê duyệt', reject: 'từ chối' };
  return map[action.toLowerCase()] || action;
}

function translateResource(resource) {
  const map = { employee: 'nhân sự', contract: 'hợp đồng', leave: 'đơn xin nghỉ', department: 'đơn vị' };
  return map[resource.toLowerCase()] || resource;
}
