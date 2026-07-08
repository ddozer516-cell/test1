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
      // هنا جعلنا الهيدر يعرض اسم المالك وزر خروج فقط بدون حقن زر الإدارة في الأعلى
      authSection.innerHTML = `
        <span style="margin-left:15px; color:#a3e635; font-weight:600;">👤 المالك: ${currentUser.username}</span>
        <button onclick="logout()" class="btn" style="padding: 6px 15px; font-size:0.85rem; background:#ef4444; border:none; margin-right:10px; cursor:pointer; color:white; border-radius:5px;">خروج</button>
      `;
      
      // هنا نقوم بحقن زرار "إدارة ملاعبك" تحت كلمة (احجز ملعبك الاحترافي الآن بكل سهوله) مباشرة داخل حاوية الـ Hero
      const heroOwnerBtnContainer = document.getElementById('heroOwnerBtnContainer');
      if (heroOwnerBtnContainer) {
        heroOwnerBtnContainer.innerHTML = `
          <a href="owner.html" class="btn btn-gradient" style="text-decoration: none; display: inline-block; margin: 15px 0; padding: 10px 35px; font-size: 1.1rem; font-weight: 700; background: linear-gradient(45deg, #22c55e, #a3e635); color: #05190e; border-radius: 30px; box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);">
            ⚙️ إدارة ملاعبك
          </a>
        `;
      }
      
      const bookingButtons = document.querySelectorAll("a[href='booking.html']");
      bookingButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          alert('أنت مسجل كصاحب ملعب، يمكنك إدارة الحجوزات من لوحتك الخاصة فقط وليس حجز ملاعب أخرى كلاعب.');
        });
      });
    }
  }
});

function logout() {
  localStorage.removeItem('user');
  window.location.reload();
}
