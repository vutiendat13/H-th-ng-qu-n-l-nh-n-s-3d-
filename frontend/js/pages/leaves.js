let currentPage = 1;
const perPage = 10;
let currentStatus = '';
let pagination;
let employees = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  
  pagination = new Pagination('pagination-container', {
    onPageChange: (page) => { currentPage = page; loadLeaves(); }
  });
  
  if (Auth.isHR() || Auth.isAdmin()) {
    loadEmployees();
  }
  
  // Tabs
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentStatus = tab.getAttribute('data-status');
      currentPage = 1;
      loadLeaves();
    });
  });
  
  document.getElementById('btn-add').addEventListener('click', showForm);
  
  loadLeaves();
});

async function loadEmployees() {
  try {
    const res = await api.get('/employees', { per_page: 1000, status: 'ACTIVE' });
    if (res.success) employees = res.data;
  } catch (e) {}
}

async function loadLeaves() {
  const tbody = document.getElementById('data-table');
  try {
    const params = { page: currentPage, per_page: perPage };
    if (currentStatus) params.status = currentStatus;
    
    // If not HR/Admin, maybe filter by self in backend (assumed via token)
    const res = await api.get('/leaves', params);
    if (res.success) {
      renderTable(res.data);
      if (res.pagination) pagination.render(res.pagination.page, res.pagination.pages, res.pagination.total);
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-error">Lỗi tải dữ liệu</td></tr>`;
  }
}

function renderTable(data) {
  const tbody = document.getElementById('data-table');
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Không có đơn nghỉ phép</td></tr>`;
    return;
  }
  
  const isApprover = Auth.isHR() || Auth.isAdmin();
  
  tbody.innerHTML = data.map(l => {
    let statusClass = 'badge-neutral', statusText = 'Chờ duyệt';
    if (l.status === 'APPROVED') { statusClass = 'badge-success'; statusText = 'Đã duyệt'; }
    else if (l.status === 'REJECTED') { statusClass = 'badge-error'; statusText = 'Từ chối'; }
    
    let actions = '';
    if (l.status === 'PENDING' && isApprover) {
      actions += `
        <button onclick="approveLeave('${l.id}')" class="btn btn-ghost btn-icon text-success" title="Duyệt"><i data-lucide="check"></i></button>
        <button onclick="rejectLeave('${l.id}')" class="btn btn-ghost btn-icon text-error" title="Từ chối"><i data-lucide="x"></i></button>
      `;
    }
    if (Auth.isAdmin() || (l.status === 'PENDING' && l.employee_id === Auth.getUser()?.employee_id)) {
       actions += `<button onclick="deleteLeave('${l.id}')" class="btn btn-ghost btn-icon text-error"><i data-lucide="trash-2"></i></button>`;
    }

    return `
      <tr>
        <td class="font-medium">${l.employee_name || 'Nhân sự'}</td>
        <td>${l.leave_type || 'Nghỉ phép năm'}</td>
        <td>${formatDate(l.start_date)}</td>
        <td>${formatDate(l.end_date)}</td>
        <td>${l.reason || ''}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td><div class="d-flex gap-1">${actions}</div></td>
      </tr>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons({ root: tbody });
}

function showForm() {
  const isApprover = Auth.isHR() || Auth.isAdmin();
  let empSelect = '';
  
  if (isApprover) {
    empSelect = `
      <div class="form-group">
        <label class="form-label required">Nhân sự</label>
        <select id="l_employee_id" class="form-select" required>
          <option value="">-- Chọn nhân sự --</option>
          ${employees.map(e => `<option value="${e.id}">${e.code} - ${e.full_name}</option>`).join('')}
        </select>
      </div>
    `;
  }

  const content = `
    <form id="leave-form">
      ${empSelect}
      <div class="form-group">
        <label class="form-label required">Loại nghỉ</label>
        <select id="l_type" class="form-select" required>
          <option value="ANNUAL">Nghỉ phép năm</option>
          <option value="UNPAID">Nghỉ không lương</option>
          <option value="SICK">Nghỉ ốm</option>
          <option value="MATERNITY">Nghỉ thai sản</option>
        </select>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label required">Từ ngày</label>
          <input type="date" id="l_start" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label required">Đến ngày</label>
          <input type="date" id="l_end" class="form-control" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label required">Lý do</label>
        <textarea id="l_reason" class="form-control" rows="3" required></textarea>
      </div>
    </form>
  `;

  Modal.show({
    title: 'Tạo đơn xin nghỉ',
    content,
    onConfirm: async () => {
      const payload = {
        type: document.getElementById('l_type').value,
        start_date: document.getElementById('l_start').value,
        end_date: document.getElementById('l_end').value,
        reason: document.getElementById('l_reason').value
      };
      
      const empEl = document.getElementById('l_employee_id');
      if (empEl) {
        payload.employee_id = empEl.value;
        if (!payload.employee_id) throw new Error('Chọn nhân sự');
      }
      
      if (!payload.start_date || !payload.end_date || !payload.reason) {
        Toast.error('Vui lòng nhập đủ thông tin');
        throw new Error('Validation');
      }
      
      try {
        await api.post('/leaves', payload);
        Toast.success('Tạo đơn thành công');
        loadLeaves();
        Modal.hide();
      } catch (e) {
        Toast.error(e.message);
        throw e;
      }
    }
  });
}

window.approveLeave = async function(id) {
  try {
    await api.post(`/leaves/${id}/approve`);
    Toast.success('Đã duyệt đơn');
    loadLeaves();
  } catch (e) { Toast.error(e.message); }
};

window.rejectLeave = async function(id) {
  try {
    await api.post(`/leaves/${id}/reject`);
    Toast.success('Đã từ chối đơn');
    loadLeaves();
  } catch (e) { Toast.error(e.message); }
};

window.deleteLeave = async function(id) {
  if (await Confirm.show({ title: 'Xóa đơn', message: 'Bạn muốn xóa đơn nghỉ phép này?' })) {
    try {
      await api.delete(`/leaves/${id}`);
      Toast.success('Đã xóa');
      loadLeaves();
    } catch (e) { Toast.error(e.message); }
  }
};
