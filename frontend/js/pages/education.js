let currentPage = 1;
const perPage = 10;
let employees = [];
let employeeIdFilter = '';
let pagination;

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  
  pagination = new Pagination('pagination-container', {
    onPageChange: (p) => { currentPage = p; loadData(); }
  });
  
  await loadEmployees();
  loadData();
  
  document.getElementById('filter-employee').addEventListener('change', (e) => {
    employeeIdFilter = e.target.value;
    currentPage = 1;
    loadData();
  });
  
  const addBtn = document.getElementById('btn-add');
  if (addBtn) addBtn.addEventListener('click', () => showForm());
});

async function loadEmployees() {
  try {
    const res = await api.get('/employees', { per_page: 1000, status: 'ACTIVE' });
    if (res.success) {
      employees = res.data;
      const select = document.getElementById('filter-employee');
      employees.forEach(e => {
        select.add(new Option(`${e.code} - ${e.full_name}`, e.id));
      });
    }
  } catch (e) {}
}

async function loadData() {
  const tbody = document.getElementById('data-table');
  try {
    const params = { page: currentPage, per_page: perPage };
    if (employeeIdFilter) params.employee_id = employeeIdFilter;
    
    const res = await api.get('/education', params);
    if (res.success) {
      renderTable(res.data);
      if (res.pagination) pagination.render(res.pagination.page, res.pagination.pages, res.pagination.total);
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-error">Lỗi tải dữ liệu</td></tr>`;
  }
}

function renderTable(data) {
  const tbody = document.getElementById('data-table');
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
    return;
  }
  
  tbody.innerHTML = data.map(item => {
    let actions = '';
    if (Auth.isHR()) actions += `<button onclick="showForm('${item.id}')" class="btn btn-ghost btn-icon"><i data-lucide="edit-2"></i></button>`;
    if (Auth.isAdmin()) actions += `<button onclick="deleteEdu('${item.id}')" class="btn btn-ghost btn-icon text-error"><i data-lucide="trash-2"></i></button>`;
    
    return `
      <tr>
        <td class="font-medium">${item.employee_name || '-'}</td>
        <td>${item.degree || '-'}</td>
        <td>${item.major || '-'}</td>
        <td>${item.institution || '-'}</td>
        <td>${item.graduation_year || '-'}</td>
        <td><div class="d-flex gap-1">${actions}</div></td>
      </tr>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons({ root: tbody });
}

async function showForm(id = null) {
  let edu = null;
  if (id) {
    try {
      const res = await api.get(`/education/${id}`);
      if (res.success) edu = res.data;
    } catch(e) {}
  }

  const content = `
    <form id="edu-form">
      <div class="form-group">
        <label class="form-label required">Nhân sự</label>
        <select id="e_employee_id" class="form-select" required ${id ? 'disabled' : ''}>
          <option value="">-- Chọn nhân sự --</option>
          ${employees.map(e => `<option value="${e.id}" ${edu && edu.employee_id == e.id ? 'selected':''}>${e.full_name}</option>`).join('')}
        </select>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label required">Trình độ</label>
          <input type="text" id="e_degree" class="form-control" value="${edu ? edu.degree : ''}" placeholder="VD: Cử nhân, Thạc sĩ..." required>
        </div>
        <div class="form-group">
          <label class="form-label">Năm tốt nghiệp</label>
          <input type="number" id="e_year" class="form-control" value="${edu ? edu.graduation_year : new Date().getFullYear()}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label required">Chuyên ngành</label>
        <input type="text" id="e_major" class="form-control" value="${edu ? edu.major : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label required">Cơ sở đào tạo</label>
        <input type="text" id="e_inst" class="form-control" value="${edu ? edu.institution : ''}" required>
      </div>
    </form>
  `;

  Modal.show({
    title: id ? 'Cập nhật Trình độ' : 'Thêm Trình độ',
    content,
    onConfirm: async () => {
      const payload = {
        employee_id: document.getElementById('e_employee_id').value,
        degree: document.getElementById('e_degree').value.trim(),
        major: document.getElementById('e_major').value.trim(),
        institution: document.getElementById('e_inst').value.trim(),
        graduation_year: parseInt(document.getElementById('e_year').value) || null
      };
      
      if(!payload.employee_id || !payload.degree || !payload.major || !payload.institution) {
        Toast.error('Vui lòng điền đủ thông tin');
        throw new Error('Validation');
      }
      
      try {
        if(id) await api.put(`/education/${id}`, payload);
        else await api.post('/education', payload);
        Toast.success('Lưu thành công');
        loadData();
        Modal.hide();
      } catch(e) {
        Toast.error(e.message); throw e;
      }
    }
  });
}

window.deleteEdu = async function(id) {
  if (await Confirm.show({ title: 'Xóa dữ liệu', message: 'Bạn có chắc muốn xóa bản ghi này?' })) {
    try {
      await api.delete(`/education/${id}`);
      Toast.success('Xóa thành công');
      loadData();
    } catch(e) { Toast.error(e.message); }
  }
};
