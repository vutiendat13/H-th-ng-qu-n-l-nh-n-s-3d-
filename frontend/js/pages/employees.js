let currentPage = 1;
const perPage = 10;
let currentFilters = {
  search: new URLSearchParams(window.location.search).get('search') || '',
  department_id: '',
  position_id: '',
  status: '',
  sort_by: 'code',
  sort_order: 'asc'
};

let pagination;

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  
  // Set initial search value from URL
  if (currentFilters.search) {
    document.getElementById('search-input').value = currentFilters.search;
  }
  
  pagination = new Pagination('pagination-container', {
    onPageChange: (page) => {
      currentPage = page;
      loadEmployees();
    }
  });

  // Load select options
  await loadFilterOptions();
  
  // Initial load
  loadEmployees();
  
  // Setup event listeners
  setupEventListeners();
});

async function loadFilterOptions() {
  try {
    const [deptRes, posRes] = await Promise.all([
      api.get('/departments'),
      api.get('/positions')
    ]);
    
    if (deptRes.success) {
      const select = document.getElementById('filter-dept');
      deptRes.data.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.name;
        select.appendChild(opt);
      });
    }
    
    if (posRes.success) {
      const select = document.getElementById('filter-pos');
      posRes.data.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
      });
    }
  } catch (error) {
    console.error('Failed to load filter options', error);
  }
}

function setupEventListeners() {
  // Debounce search
  let searchTimeout;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = e.target.value;
      currentPage = 1;
      loadEmployees();
    }, 300);
  });
  
  // Filters
  const selects = ['filter-dept', 'filter-pos', 'filter-status'];
  selects.forEach(id => {
    document.getElementById(id).addEventListener('change', (e) => {
      const key = id.replace('filter-', '');
      currentFilters[key === 'dept' ? 'department_id' : key === 'pos' ? 'position_id' : 'status'] = e.target.value;
      currentPage = 1;
      loadEmployees();
    });
  });
  
  // Sorting
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const sortKey = th.getAttribute('data-sort');
      if (currentFilters.sort_by === sortKey) {
        currentFilters.sort_order = currentFilters.sort_order === 'asc' ? 'desc' : 'asc';
      } else {
        currentFilters.sort_by = sortKey;
        currentFilters.sort_order = 'asc';
      }
      loadEmployees();
    });
  });
  
  // Check all
  document.getElementById('check-all').addEventListener('change', (e) => {
    document.querySelectorAll('.row-checkbox').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });
}

async function loadEmployees() {
  const tbody = document.getElementById('employees-table');
  
  // Skeleton
  let skeleton = '';
  for(let i=0; i<5; i++) {
    skeleton += `<tr><td colspan="8"><div class="skeleton skeleton-text"></div></td></tr>`;
  }
  tbody.innerHTML = skeleton;
  
  try {
    const res = await api.get('/employees', {
      page: currentPage,
      per_page: perPage,
      ...currentFilters
    });
    
    if (res.success) {
      renderEmployees(res.data);
      if (res.pagination) {
        pagination.render(res.pagination.page, res.pagination.pages, res.pagination.total);
      }
    }
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-error">Lỗi tải dữ liệu</td></tr>`;
  }
}

function renderEmployees(data) {
  const tbody = document.getElementById('employees-table');
  const isAdmin = Auth.isAdmin();
  const isHR = Auth.isHR();
  
  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i data-lucide="users" class="empty-state-icon"></i>
            <div class="empty-state-title">Không tìm thấy nhân sự</div>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons({ root: tbody });
    return;
  }
  
  tbody.innerHTML = data.map(emp => {
    const statusClass = emp.status === 'ACTIVE' ? 'badge-success' : 
                        emp.status === 'ON_LEAVE' ? 'badge-warning' : 'badge-neutral';
    
    const statusText = emp.status === 'ACTIVE' ? 'Đang công tác' : 
                       emp.status === 'ON_LEAVE' ? 'Nghỉ phép' : 'Đã nghỉ việc';
    
    let actions = `<a href="/pages/employee-detail.html?id=${emp.id}" class="btn btn-ghost btn-icon" title="Xem chi tiết"><i data-lucide="eye"></i></a>`;
    
    if (isHR) {
      actions += `<a href="/pages/employee-form.html?id=${emp.id}" class="btn btn-ghost btn-icon" title="Chỉnh sửa"><i data-lucide="edit-2"></i></a>`;
    }
    
    if (isAdmin) {
      actions += `<button onclick="deleteEmployee('${emp.id}', '${emp.full_name}')" class="btn btn-ghost btn-icon text-error" title="Xóa"><i data-lucide="trash-2"></i></button>`;
    }

    return `
      <tr>
        <td><input type="checkbox" class="form-check-input row-checkbox" value="${emp.id}"></td>
        <td class="font-medium">${emp.code}</td>
        <td>
          <a href="/pages/employee-detail.html?id=${emp.id}" class="d-flex align-center gap-2" style="color:var(--color-text);font-weight:500;">
            ${emp.full_name}
          </a>
        </td>
        <td>${emp.department || '-'}</td>
        <td>${emp.position || '-'}</td>
        <td>${emp.education_level || '-'}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td><div class="employee-actions">${actions}</div></td>
      </tr>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons({ root: tbody });
}

window.deleteEmployee = async function(id, name) {
  const confirmed = await Confirm.show({
    title: 'Xóa nhân sự',
    message: `Bạn có chắc chắn muốn xóa nhân sự <strong>${name}</strong>? Dữ liệu không thể khôi phục.`
  });
  
  if (confirmed) {
    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.success) {
        Toast.success('Xóa nhân sự thành công');
        loadEmployees();
      }
    } catch (error) {
      Toast.error('Lỗi khi xóa nhân sự');
    }
  }
};
