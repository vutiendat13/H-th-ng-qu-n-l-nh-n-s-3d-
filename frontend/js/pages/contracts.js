let currentPage = 1;
const perPage = 10;
let currentFilters = { search: '', type: '', status: '' };
let pagination;
let employees = []; // for select dropdown

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  
  pagination = new Pagination('pagination-container', {
    onPageChange: (page) => { currentPage = page; loadContracts(); }
  });
  
  loadContracts();
  if (Auth.isHR()) {
    loadEmployees(); // Preload for form
  }
  
  // Events
  document.getElementById('search-input').addEventListener('input', (e) => {
    currentFilters.search = e.target.value;
    debounce(() => { currentPage = 1; loadContracts(); }, 300)();
  });
  
  document.getElementById('filter-type').addEventListener('change', (e) => {
    currentFilters.type = e.target.value; currentPage = 1; loadContracts();
  });
  
  document.getElementById('filter-status').addEventListener('change', (e) => {
    currentFilters.status = e.target.value; currentPage = 1; loadContracts();
  });
  
  const addBtn = document.getElementById('btn-add');
  if (addBtn) addBtn.addEventListener('click', () => showForm());
});

let timeoutId;
function debounce(fn, ms) {
  return function() { clearTimeout(timeoutId); timeoutId = setTimeout(fn, ms); };
}

async function loadEmployees() {
  try {
    const res = await api.get('/employees', { per_page: 1000, status: 'ACTIVE' });
    if (res.success) employees = res.data;
  } catch (e) {}
}

async function loadContracts() {
  const tbody = document.getElementById('data-table');
  try {
    const res = await api.get('/contracts', { page: currentPage, per_page: perPage, ...currentFilters });
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
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Không có hợp đồng nào</td></tr>`;
    return;
  }
  
  const typeMap = { 'DETERMINATE': 'Xác định TH', 'INDETERMINATE': 'Không XĐTH', 'PROBATION': 'Thử việc' };
  
  tbody.innerHTML = data.map(c => {
    // Determine status badge
    let statusClass = 'badge-neutral', statusText = c.status;
    if (c.status === 'ACTIVE') {
      // check expiring (e.g. < 30 days) if end_date exists
      if (c.end_date) {
        const daysLeft = (new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysLeft < 0) { statusClass = 'badge-error'; statusText = 'Đã hết hạn'; }
        else if (daysLeft <= 30) { statusClass = 'badge-warning'; statusText = 'Sắp hết hạn'; }
        else { statusClass = 'badge-success'; statusText = 'Đang hiệu lực'; }
      } else {
        statusClass = 'badge-success'; statusText = 'Đang hiệu lực';
      }
    } else if (c.status === 'TERMINATED') {
      statusClass = 'badge-error'; statusText = 'Đã chấm dứt';
    } else {
      statusText = c.status; // Fallback
    }

    let actions = '';
    if (Auth.isHR()) actions += `<button onclick="showForm('${c.id}')" class="btn btn-ghost btn-icon"><i data-lucide="edit-2"></i></button>`;
    if (Auth.isAdmin()) actions += `<button onclick="deleteContract('${c.id}', '${c.contract_number}')" class="btn btn-ghost btn-icon text-error"><i data-lucide="trash-2"></i></button>`;

    return `
      <tr>
        <td class="font-medium">${c.contract_number}</td>
        <td>
          <a href="/pages/employee-detail.html?id=${c.employee_id}" class="text-primary font-medium">
            ${c.employee_name || 'Nhân sự'}
          </a>
        </td>
        <td>${typeMap[c.type] || c.type}</td>
        <td>${formatDate(c.start_date)}</td>
        <td>${c.end_date ? formatDate(c.end_date) : '-'}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td><div class="d-flex gap-1">${actions}</div></td>
      </tr>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons({ root: tbody });
}

async function showForm(id = null) {
  let contract = null;
  if (id) {
    try {
      const res = await api.get(`/contracts/${id}`);
      if (res.success) contract = res.data;
    } catch (e) {
      Toast.error('Lỗi khi tải chi tiết hợp đồng');
      return;
    }
  }
  
  const empOptions = employees.map(e => 
    `<option value="${e.id}" ${contract && contract.employee_id == e.id ? 'selected' : ''}>${e.code} - ${e.full_name}</option>`
  ).join('');

  const content = `
    <form id="contract-form">
      <div class="form-group">
        <label class="form-label required">Nhân sự</label>
        <select id="c_employee_id" class="form-select" required ${id ? 'disabled' : ''}>
          <option value="">-- Chọn nhân sự --</option>
          ${empOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label required">Số hợp đồng</label>
        <input type="text" id="c_number" class="form-control" value="${contract ? contract.contract_number : ''}" required>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label required">Loại hợp đồng</label>
          <select id="c_type" class="form-select" required>
            <option value="PROBATION" ${contract && contract.type === 'PROBATION' ? 'selected' : ''}>Thử việc</option>
            <option value="DETERMINATE" ${contract && contract.type === 'DETERMINATE' ? 'selected' : ''}>Xác định thời hạn</option>
            <option value="INDETERMINATE" ${contract && contract.type === 'INDETERMINATE' ? 'selected' : ''}>Không xác định thời hạn</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label required">Trạng thái</label>
          <select id="c_status" class="form-select" required>
            <option value="ACTIVE" ${contract && contract.status === 'ACTIVE' ? 'selected' : ''}>Đang hiệu lực</option>
            <option value="TERMINATED" ${contract && contract.status === 'TERMINATED' ? 'selected' : ''}>Đã chấm dứt</option>
          </select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label required">Từ ngày</label>
          <input type="date" id="c_start" class="form-control" value="${contract ? contract.start_date.split('T')[0] : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Đến ngày</label>
          <input type="date" id="c_end" class="form-control" value="${contract && contract.end_date ? contract.end_date.split('T')[0] : ''}">
        </div>
      </div>
    </form>
  `;

  Modal.show({
    title: id ? 'Cập nhật Hợp đồng' : 'Thêm Hợp đồng',
    content,
    size: 'modal-md',
    onConfirm: async () => {
      const payload = {
        employee_id: document.getElementById('c_employee_id').value,
        contract_number: document.getElementById('c_number').value,
        type: document.getElementById('c_type').value,
        status: document.getElementById('c_status').value,
        start_date: document.getElementById('c_start').value,
        end_date: document.getElementById('c_end').value || null
      };
      
      if (!payload.employee_id || !payload.contract_number || !payload.start_date) {
        Toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
        throw new Error('Validation');
      }
      
      try {
        if (id) await api.put(`/contracts/${id}`, payload);
        else await api.post('/contracts', payload);
        Toast.success('Lưu hợp đồng thành công');
        loadContracts();
        Modal.hide();
      } catch (e) {
        Toast.error(e.message);
        throw e;
      }
    }
  });
}

window.deleteContract = async function(id, num) {
  if (await Confirm.show({ title: 'Xóa hợp đồng', message: `Xóa hợp đồng số <strong>${num}</strong>?` })) {
    try {
      await api.delete(`/contracts/${id}`);
      Toast.success('Đã xóa');
      loadContracts();
    } catch (e) { Toast.error(e.message); }
  }
};
