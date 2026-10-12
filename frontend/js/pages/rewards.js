document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  loadRewards();
});

async function loadRewards() {
  const tbody = document.getElementById('data-table');
  try {
    const res = await api.get('/rewards');
    if (res.success && res.data.length > 0) {
      tbody.innerHTML = res.data.map(r => `
        <tr>
          <td>${r.employee_name || '-'}</td>
          <td>${r.reward_type || '-'}</td>
          <td>${formatDate(r.date)}</td>
          <td>${r.content || '-'}</td>
          <td>${r.decision_number || '-'}</td>
          <td><button class="btn btn-ghost btn-icon text-error"><i data-lucide="trash"></i></button></td>
        </tr>
      `).join('');
      if(window.lucide) lucide.createIcons({root:tbody});
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>';
    }
  } catch(e) {}
}
