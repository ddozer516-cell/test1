document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const authSection = document.getElementById('authSection');

  if (currentUser && authSection) {
    if (currentUser.role === 'player') {
      authSection.innerHTML = `
        <span style="margin-left:15px; color:#22c55e; font-weight:600;">⚽ كابتن: ${currentUser.username}</span>
        <button onclick="logout()" class="btn" style="padding: 6px 15px; font-size:0.85rem; background:#ef4444; border:none; cursor:pointer; color:white; border-radius:5px;">خروج</button>
      `;
    } else if (currentUser.role === 'owner') {
      authSection.innerHTML = `
        <span style="margin-left:15px; color:#a3e635; font-weight:600;">👤 المالك: ${currentUser.username}</span>
        <a href="owner.html" class="btn btn-gradient" style="padding: 6px 15px; font-size:0.85rem; text-decoration:none;">إدارة ملاعبك</a>
        <button onclick="logout()" class="btn" style="padding: 6px 15px; font-size:0.85rem; background:#ef4444; border:none; margin-right:10px; cursor:pointer; color:white; border-radius:5px;">خروج</button>
      `;
      
      const bookingButtons = document.querySelectorAll("a[href='booking.html']");
      bookingButtons.forEach(btn => {
        btn.innerText = "عرض وإدارة طلبات ملاعبك";
        btn.setAttribute('href', 'owner.html');
      });
    }
  }
});

function logout() {
  localStorage.removeItem('user');
  window.location.reload();
}