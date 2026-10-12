const resources = [
  { id: 'employees', name: 'Hồ sơ nhân sự' },
  { id: 'departments', name: 'Đơn vị / Phòng ban' },
  { id: 'positions', name: 'Chức vụ' },
  { id: 'contracts', name: 'Hợp đồng' },
  { id: 'leaves', name: 'Nghỉ phép' },
  { id: 'rewards', name: 'Khen thưởng / Kỷ luật' },
  { id: 'system', name: 'Hệ thống (Tài khoản)' }
];

// Mock permission state since backend route might be complex to implement fully dynamically
let permissions = {
  ADMIN: {},
  HR: {},
  VIEWER: {}
};

// Initialize default state
resources.forEach(r => {
  permissions.ADMIN[r.id] = { view: true, create: true, edit: true, delete: true };
  permissions.HR[r.id] = { view: true, create: true, edit: true, delete: false };
  permissions.VIEWER[r.id] = { view: true, create: false, edit: false, delete: false };
});
// Special limits
permissions.HR['system'] = { view: false, create: false, edit: false, delete: false };
permissions.VIEWER['system'] = { view: false, create: false, edit: false, delete: false };

let currentRole = 'ADMIN';

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  if (!Auth.isAdmin()) {
    Toast.error('Truy cập bị từ chối');
    window.location.href = '/pages/dashboard.html';
    return;
  }
  
  // Try load from backend if exists
  api.get('/permissions').then(res => {
    if(res.success && res.data) permissions = res.data;
    renderMatrix();
  }).catch(() => {
    // fallback to mock
    renderMatrix();
  });
  
  document.querySelectorAll('.role-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.role-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentRole = item.getAttribute('data-role');
      document.getElementById('matrix-title').textContent = `Quyền hạn của ${currentRole}`;
      renderMatrix();
    });
  });
  
  document.getElementById('btn-save').addEventListener('click', async () => {
    try {
      // Fake saving
      // await api.post('/permissions', { permissions });
      Toast.success('Cập nhật phân quyền thành công');
    } catch(e) {
      Toast.error('Lỗi khi lưu phân quyền');
    }
  });
});

function renderMatrix() {
  const tbody = document.getElementById('matrix-body');
  
  tbody.innerHTML = resources.map(res => {
    const perms = permissions[currentRole][res.id] || { view: false, create: false, edit: false, delete: false };
    const isAdmin = currentRole === 'ADMIN';
    const disableInput = isAdmin ? 'disabled' : ''; // Admin has all rights hardcoded visually
    
    return `
      <tr>
        <td>${res.name}</td>
        <td><input type="checkbox" style="width:16px;height:16px;cursor:pointer" ${perms.view ? 'checked' : ''} ${disableInput} onchange="updatePerm('${res.id}', 'view', this.checked)"></td>
        <td><input type="checkbox" style="width:16px;height:16px;cursor:pointer" ${perms.create ? 'checked' : ''} ${disableInput} onchange="updatePerm('${res.id}', 'create', this.checked)"></td>
        <td><input type="checkbox" style="width:16px;height:16px;cursor:pointer" ${perms.edit ? 'checked' : ''} ${disableInput} onchange="updatePerm('${res.id}', 'edit', this.checked)"></td>
        <td><input type="checkbox" style="width:16px;height:16px;cursor:pointer" ${perms.delete ? 'checked' : ''} ${disableInput} onchange="updatePerm('${res.id}', 'delete', this.checked)"></td>
      </tr>
    `;
  }).join('');
}

window.updatePerm = function(resourceId, action, checked) {
  if (currentRole === 'ADMIN') return; // Cannot modify Admin
  if (!permissions[currentRole][resourceId]) {
    permissions[currentRole][resourceId] = { view: false, create: false, edit: false, delete: false };
  }
  permissions[currentRole][resourceId][action] = checked;
};
