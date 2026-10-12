let departments = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  
  await loadDepartments();
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderTable(e.target.value);
    });
  }
  
  const addBtn = document.getElementById('btn-add');
  if (addBtn) {
    addBtn.addEventListener('click', () => showForm());
  }
});

async function loadDepartments() {
  const tbody = document.getElementById('data-table');
  try {
    const res = await api.get('/departments');
    if (res.success) {
      departments = res.data;
      renderTable();
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-error">Lỗi tải dữ liệu</td></tr>`;
  }
}

function renderTable(searchTerm = '') {
  const tbody = document.getElementById('data-table');
  const isAdmin = Auth.isAdmin();
  const isHR = Auth.isHR();
  
  let data = departments;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    data = data.filter(d => 
      (d.code && d.code.toLowerCase().includes(term)) || 
      (d.name && d.name.toLowerCase().includes(term))
    );
  }
  
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Không tìm thấy đơn vị nào</td></tr>`;
    return;
  }
  
  tbody.innerHTML = data.map(d => {
    const statusClass = d.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral';
    const statusText = d.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng';
    
    let actions = '';
    if (isHR) {
      actions += `<button onclick="showForm('${d.id}')" class="btn btn-ghost btn-icon"><i data-lucide="edit-2"></i></button>`;
    }
    if (isAdmin) {
      actions += `<button onclick="deleteDept('${d.id}', '${d.name}')" class="btn btn-ghost btn-icon text-error"><i data-lucide="trash-2"></i></button>`;
    }
    
    return `
      <tr>
        <td class="font-medium">${d.code}</td>
        <td>${d.name}</td>
        <td>${d.head_name || '-'}</td>
        <td>${d.employee_count || 0}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td><div class="d-flex gap-1">${actions}</div></td>
      </tr>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons({ root: tbody });
}

function showForm(id = null) {
  const dept = id ? departments.find(d => d.id == id) : null;
  const title = id ? 'Cập nhật Đơn vị' : 'Thêm Đơn vị';
  
  const content = `
    <form id="dept-form">
      <div class="form-group">
        <label class="form-label required">Mã đơn vị</label>
        <input type="text" id="dept_code" class="form-control" value="${dept ? dept.code : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label required">Tên đơn vị</label>
        <input type="text" id="dept_name" class="form-control" value="${dept ? dept.name : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Trạng thái</label>
        <select id="dept_status" class="form-select">
          <option value="ACTIVE" ${dept && dept.status === 'ACTIVE' ? 'selected' : ''}>Hoạt động</option>
          <option value="INACTIVE" ${dept && dept.status === 'INACTIVE' ? 'selected' : ''}>Tạm ngưng</option>
        </select>
      </div>
    </form>
  `;
  
  Modal.show({
    title,
    content,
    onConfirm: async () => {
      const code = document.getElementById('dept_code').value.trim();
      const name = document.getElementById('dept_name').value.trim();
      const status = document.getElementById('dept_status').value;
      
      if (!code || !name) {
        Toast.error('Vui lòng nhập đầy đủ mã và tên đơn vị');
        throw new Error('Validation failed'); // prevent modal close
      }
      
      const payload = { code, name, status };
      try {
        if (id) {
          await api.put(`/departments/${id}`, payload);
          Toast.success('Cập nhật thành công');
        } else {
          await api.post('/departments', payload);
          Toast.success('Thêm mới thành công');
        }
        await loadDepartments();
        Modal.hide();
      } catch (error) {
        Toast.error(error.message);
        throw error;
      }
    }
  });
}

window.deleteDept = async function(id, name) {
  const confirmed = await Confirm.show({
    title: 'Xóa đơn vị',
    message: `Bạn có chắc chắn muốn xóa đơn vị <strong>${name}</strong>? Các nhân sự thuộc đơn vị này có thể bị ảnh hưởng.`
  });
  
  if (confirmed) {
    try {
      await api.delete(`/departments/${id}`);
      Toast.success('Xóa đơn vị thành công');
      await loadDepartments();
    } catch (e) {
      Toast.error(e.message || 'Lỗi khi xóa đơn vị');
    }
  }
};
