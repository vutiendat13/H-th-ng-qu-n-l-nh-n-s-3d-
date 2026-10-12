let viewMode = 'table'; // table or timeline

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  
  await loadEmployees();
  
  document.getElementById('filter-employee').addEventListener('change', (e) => {
    if (e.target.value) {
      loadData(e.target.value);
    } else {
      document.getElementById('data-table').innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Vui lòng chọn nhân sự</td></tr>';
      document.getElementById('timeline-container').innerHTML = '';
    }
  });
  
  document.getElementById('btn-toggle-view').addEventListener('click', () => {
    viewMode = viewMode === 'table' ? 'timeline' : 'table';
    document.getElementById('view-table').classList.toggle('hidden', viewMode === 'timeline');
    document.getElementById('view-timeline').classList.toggle('hidden', viewMode === 'table');
    
    const icon = viewMode === 'table' ? 'list' : 'clock';
    document.getElementById('btn-toggle-view').innerHTML = `<i data-lucide="${icon}"></i> Chuyển đổi góc nhìn`;
    if (window.lucide) lucide.createIcons();
  });
});

async function loadEmployees() {
  try {
    const res = await api.get('/employees', { per_page: 1000 });
    if (res.success) {
      const select = document.getElementById('filter-employee');
      res.data.forEach(e => {
        select.add(new Option(`${e.code} - ${e.full_name}`, e.id));
      });
    }
  } catch (e) {}
}

async function loadData(employeeId) {
  try {
    const res = await api.get('/work-history', { employee_id: employeeId });
    if (res.success) {
      renderTable(res.data);
      renderTimeline(res.data);
    }
  } catch (e) {
    Toast.error('Lỗi tải dữ liệu');
  }
}

function renderTable(data) {
  const tbody = document.getElementById('data-table');
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
    return;
  }
  
  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${item.department_name || '-'}</td>
      <td>${item.position_name || '-'}</td>
      <td>${formatDate(item.start_date)}</td>
      <td>${item.end_date ? formatDate(item.end_date) : 'Hiện tại'}</td>
      <td>${item.decision_number || '-'}</td>
      <td>${item.notes || '-'}</td>
    </tr>
  `).join('');
}

function renderTimeline(data) {
  const container = document.getElementById('timeline-container');
  if (data.length === 0) {
    container.innerHTML = `<div class="text-center text-muted">Không có dữ liệu</div>`;
    return;
  }
  
  // Sort descending by date
  const sorted = [...data].sort((a,b) => new Date(b.start_date) - new Date(a.start_date));
  
  container.innerHTML = `
    <div style="position: relative; padding-left: 24px;">
      <div style="content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: var(--color-border);"></div>
      ${sorted.map(item => `
        <div style="position: relative; margin-bottom: 24px;">
          <div style="position: absolute; left: -24px; top: 4px; width: 16px; height: 16px; border-radius: 50%; background: var(--color-primary); border: 4px solid var(--color-surface);"></div>
          <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">
            ${formatDate(item.start_date)} - ${item.end_date ? formatDate(item.end_date) : 'Hiện tại'}
          </div>
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 15px;">${item.position_name || 'Nhân viên'}</div>
          <div style="color: var(--color-text-secondary); font-size: 14px;">${item.department_name || '-'}</div>
          ${item.decision_number ? `<div style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">QĐ: ${item.decision_number}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}
