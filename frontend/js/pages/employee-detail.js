document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get('id');
  
  if (!employeeId) {
    Toast.error('Không tìm thấy ID nhân sự');
    window.location.href = '/pages/employees.html';
    return;
  }
  
  await loadEmployeeData(employeeId);
});

async function loadEmployeeData(id) {
  try {
    const res = await api.get(`/employees/${id}`);
    if (res.success && res.data) {
      renderProfile(res.data);
    } else {
      Toast.error('Không thể tải thông tin nhân sự');
    }
  } catch (error) {
    document.getElementById('profile-content').innerHTML = `
      <div class="empty-state">
        <i data-lucide="alert-triangle" class="empty-state-icon text-error"></i>
        <div class="empty-state-title">Lỗi tải dữ liệu</div>
        <p>Không thể kết nối đến máy chủ hoặc nhân sự không tồn tại.</p>
        <a href="/pages/employees.html" class="btn btn-primary mt-4">Quay lại danh sách</a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }
}

function renderProfile(emp) {
  const isHR = Auth.isHR();
  const statusClass = emp.status === 'ACTIVE' ? 'badge-success' : 
                      emp.status === 'ON_LEAVE' ? 'badge-warning' : 'badge-neutral';
  const statusText = emp.status === 'ACTIVE' ? 'Đang công tác' : 
                     emp.status === 'ON_LEAVE' ? 'Nghỉ phép' : 'Đã nghỉ việc';

  let html = `
    <div class="profile-header">
      <div class="profile-avatar-wrapper">
        <div class="profile-avatar">
          <img src="${emp.avatar || '/assets/avatar-default.svg'}" alt="Avatar">
        </div>
      </div>
      <div class="profile-info">
        <div class="d-flex justify-between align-center">
          <h2 class="profile-name">${emp.full_name}</h2>
          ${isHR ? `<a href="/pages/employee-form.html?id=${emp.id}" class="btn btn-secondary btn-sm"><i data-lucide="edit-2"></i> Chỉnh sửa</a>` : ''}
        </div>
        <div class="profile-meta">
          <div class="profile-meta-item"><i data-lucide="hash"></i> ${emp.code}</div>
          <div class="profile-meta-item"><i data-lucide="building-2"></i> ${emp.department || 'Chưa xếp đơn vị'}</div>
          <div class="profile-meta-item"><i data-lucide="briefcase"></i> ${emp.position || 'Chưa xếp chức vụ'}</div>
        </div>
        <div>
          <span class="badge ${statusClass}">${statusText}</span>
        </div>
      </div>
    </div>
    
    <div class="card mb-4">
      <div class="card-header border-bottom-0 pb-0">
        <div class="tabs w-100">
          <div class="tab-item active" data-target="tab-overview">Tổng quan</div>
          <div class="tab-item" data-target="tab-work">Công tác</div>
          <div class="tab-item" data-target="tab-contracts">Hợp đồng</div>
        </div>
      </div>
      <div class="card-body">
        
        <!-- Tab Tổng quan -->
        <div class="tab-content active" id="tab-overview">
          <div class="info-grid">
            <div>
              <h3 class="font-medium mb-3">Thông tin cá nhân</h3>
              <div class="info-item">
                <div class="info-label">Ngày sinh</div>
                <div class="info-value">${formatDate(emp.birth_date) || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Giới tính</div>
                <div class="info-value">${emp.gender === 'M' ? 'Nam' : emp.gender === 'F' ? 'Nữ' : 'Khác'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">CCCD/CMND</div>
                <div class="info-value">${emp.identity_card || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Điện thoại</div>
                <div class="info-value">${emp.phone || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${emp.email || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Địa chỉ</div>
                <div class="info-value">${emp.address || '-'}</div>
              </div>
            </div>
            
            <div>
              <h3 class="font-medium mb-3">Thông tin công việc</h3>
              <div class="info-item">
                <div class="info-label">Ngày vào trường</div>
                <div class="info-value">${formatDate(emp.hire_date) || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Trình độ chuyên môn</div>
                <div class="info-value">${emp.education_level || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Chuyên ngành đào tạo</div>
                <div class="info-value">${emp.major || '-'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tab Công tác -->
        <div class="tab-content" id="tab-work">
          <div class="text-center text-muted py-4">Chưa có dữ liệu quá trình công tác</div>
        </div>
        
        <!-- Tab Hợp đồng -->
        <div class="tab-content" id="tab-contracts">
          <div class="text-center text-muted py-4">Chưa có dữ liệu hợp đồng</div>
        </div>
        
      </div>
    </div>
  `;
  
  document.getElementById('profile-content').innerHTML = html;
  if (window.lucide) lucide.createIcons();
  
  // Tab functionality
  const tabs = document.querySelectorAll('.tab-item');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-target')).classList.add('active');
      
      // Lazy load sub-tabs if needed here
    });
  });
}
