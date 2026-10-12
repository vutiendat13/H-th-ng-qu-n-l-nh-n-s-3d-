let positions = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  await loadPositions();
  
  const addBtn = document.getElementById('btn-add');
  if (addBtn) {
    addBtn.addEventListener('click', () => showForm());
  }
});

async function loadPositions() {
  const tbody = document.getElementById('data-table');
  try {
    const res = await api.get('/positions');
    if (res.success) {
      positions = res.data;
      renderTable();
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-error">Lỗi tải dữ liệu</td></tr>`;
  }
}

function renderTable() {
  const tbody = document.getElementById('data-table');
  const isAdmin = Auth.isAdmin();
  const isHR = Auth.isHR();
  
  if (positions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
    return;
  }
  
  tbody.innerHTML = positions.map(p => {
    let actions = '';
    if (isHR) actions += `<button onclick="showForm('${p.id}')" class="btn btn-ghost btn-icon"><i data-lucide="edit-2"></i></button>`;
    if (isAdmin) actions += `<button onclick="deletePos('${p.id}', '${p.name}')" class="btn btn-ghost btn-icon text-error"><i data-lucide="trash-2"></i></button>`;
    
    return `
      <tr>
        <td class="font-medium">${p.code}</td>
        <td>${p.name}</td>
        <td><span class="badge badge-info">Level ${p.level || 0}</span></td>
        <td>${p.employee_count || 0}</td>
        <td><div class="d-flex gap-1">${actions}</div></td>
      </tr>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons({ root: tbody });
}

function showForm(id = null) {
  const pos = id ? positions.find(p => p.id == id) : null;
  const title = id ? 'Cập nhật Chức vụ' : 'Thêm Chức vụ';
  
  const content = `
    <form id="pos-form">
      <div class="form-group">
        <label class="form-label required">Mã chức vụ</label>
        <input type="text" id="pos_code" class="form-control" value="${pos ? pos.code : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label required">Tên chức vụ</label>
        <input type="text" id="pos_name" class="form-control" value="${pos ? pos.name : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Cấp bậc (Level)</label>
        <input type="number" id="pos_level" class="form-control" value="${pos ? pos.level : 1}" min="1" max="10">
        <span class="form-hint">Số càng nhỏ, cấp bậc càng cao (1: Cao nhất)</span>
      </div>
    </form>
  `;
  
  Modal.show({
    title,
    content,
    onConfirm: async () => {
      const code = document.getElementById('pos_code').value.trim();
      const name = document.getElementById('pos_name').value.trim();
      const level = document.getElementById('pos_level').value;
      
      if (!code || !name) {
        Toast.error('Vui lòng nhập mã và tên chức vụ');
        throw new Error('Validation');
      }
      
      const payload = { code, name, level: parseInt(level) || 1 };
      try {
        if (id) await api.put(`/positions/${id}`, payload);
        else await api.post('/positions', payload);
        
        Toast.success(id ? 'Cập nhật thành công' : 'Thêm mới thành công');
        await loadPositions();
        Modal.hide();
      } catch (e) {
        Toast.error(e.message);
        throw e;
      }
    }
  });
}

window.deletePos = async function(id, name) {
  if (await Confirm.show({ title: 'Xóa chức vụ', message: `Xóa chức vụ <strong>${name}</strong>?` })) {
    try {
      await api.delete(`/positions/${id}`);
      Toast.success('Xóa thành công');
      await loadPositions();
    } catch (e) { Toast.error(e.message); }
  }
};
