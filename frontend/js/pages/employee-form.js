document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  if (!Auth.isHR()) {
    Toast.error('Bạn không có quyền truy cập trang này');
    window.location.href = '/pages/employees.html';
    return;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get('id');
  const isEdit = !!employeeId;
  
  if (isEdit) {
    document.getElementById('page-title').textContent = 'Cập nhật Nhân sự';
  }
  
  // Load selects
  await Promise.all([
    loadDepartments(),
    loadPositions()
  ]);
  
  if (isEdit) {
    await loadEmployee(employeeId);
  } else {
    // Default values for new
    document.getElementById('status').value = 'ACTIVE';
    document.getElementById('hire_date').value = new Date().toISOString().split('T')[0];
  }
  
  // Form submit
  document.getElementById('employee-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveEmployee(isEdit, employeeId);
  });
});

async function loadDepartments() {
  try {
    const res = await api.get('/departments');
    if (res.success) {
      const select = document.getElementById('department_id');
      res.data.forEach(d => {
        select.add(new Option(d.name, d.id));
      });
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadPositions() {
  try {
    const res = await api.get('/positions');
    if (res.success) {
      const select = document.getElementById('position_id');
      res.data.forEach(p => {
        select.add(new Option(p.name, p.id));
      });
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadEmployee(id) {
  try {
    const res = await api.get(`/employees/${id}`);
    if (res.success && res.data) {
      const data = res.data;
      const fields = ['code', 'full_name', 'gender', 'identity_card', 'phone', 'email', 'address', 
                      'department_id', 'position_id', 'status', 'education_level', 'major'];
      
      fields.forEach(f => {
        if (data[f] !== null && data[f] !== undefined) {
          document.getElementById(f).value = data[f];
        }
      });
      
      // Handle dates
      if (data.birth_date) document.getElementById('birth_date').value = data.birth_date.split('T')[0];
      if (data.hire_date) document.getElementById('hire_date').value = data.hire_date.split('T')[0];
      
      // Make code readonly in edit mode if required by backend, here we just keep it editable unless restricted
    }
  } catch (e) {
    Toast.error('Lỗi khi tải thông tin nhân sự');
  }
}

async function saveEmployee(isEdit, id) {
  const btn = document.getElementById('btn-save');
  const originalHtml = btn.innerHTML;
  
  const payload = {
    code: document.getElementById('code').value.trim(),
    full_name: document.getElementById('full_name').value.trim(),
    birth_date: document.getElementById('birth_date').value,
    gender: document.getElementById('gender').value,
    identity_card: document.getElementById('identity_card').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    department_id: document.getElementById('department_id').value || null,
    position_id: document.getElementById('position_id').value || null,
    status: document.getElementById('status').value,
    hire_date: document.getElementById('hire_date').value,
    education_level: document.getElementById('education_level').value.trim(),
    major: document.getElementById('major').value.trim()
  };
  
  try {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Đang lưu...';
    if (window.lucide) lucide.createIcons({ root: btn });
    
    let res;
    if (isEdit) {
      res = await api.put(`/employees/${id}`, payload);
    } else {
      res = await api.post('/employees', payload);
    }
    
    if (res.success) {
      Toast.success(isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công');
      setTimeout(() => {
        window.location.href = '/pages/employees.html';
      }, 1000);
    }
  } catch (error) {
    Toast.error(error.message || 'Lỗi khi lưu dữ liệu');
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    if (window.lucide) lucide.createIcons({ root: btn });
  }
}
