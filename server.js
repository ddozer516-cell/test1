const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// قاعدة البيانات المؤقتة في الذاكرة
const USERS = []; 
const BOOKINGS = []; 
const REVIEWS = [];
const OWNER_PRICES = {}; 

// 1. تسعير وتسجيل المستخدمين
app.post('/api/register', async (req, res) => {
    const { username, phone, password, role, location } = req.body;
    if (USERS.find(u => u.username === username)) {
        return res.status(400).json({ message: 'اسم المستخدم مسجل مسبقاً، اختر اسماً آخر!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
        id: Date.now(), 
        username, 
        phone, 
        password: hashedPassword, 
        role,
        location: location || 'غير محدد' 
    };
    
    USERS.push(newUser);
    res.status(201).json({ message: 'تم تسجيل الحساب بنجاح' });
});

// 2. تسجيل الدخول
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username);

    if (!user) return res.status(400).json({ message: 'اسم المستخدم غير موجود بالنظام!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة!' });

    res.json({ user: { id: user.id, username: user.username, role: user.role, location: user.location, phone: user.phone } });
});

// 3. جلب جميع الحجوزات للمالك
app.get('/api/bookings', (req, res) => {
    res.json(BOOKINGS);
});

// 4. إنشاء الحجز مع خيار الدفع الإلكتروني وتوليد الإيصال
app.post('/api/bookings', (req, res) => {
    const { name, phone, location, type, date, time, hours, userId, paymentMethod } = req.body;

    // فحص منع التعارض (إذا كان الملعب محجوز في نفس المكان والتوقيت)
    const hasConflict = BOOKINGS.find(b => b.location === location && b.type === type && b.date === date && b.time === time);
    if (hasConflict) {
        return res.status(400).json({ message: 'عذراً، هذا الوقت محجوز بالفعل! يرجى اختيار موعد آخر.' });
    }

    // حساب السعر الإجمالي (150 كمعدل افتراضي أو حسب تسعير المالك)
    const hourlyRate = (OWNER_PRICES[location] && OWNER_PRICES[location].hourlyRate) ? OWNER_PRICES[location].hourlyRate : 150;
    const totalAmount = hourlyRate * parseInt(hours);

    // توليد رقم فاتورة أو إيصال فريد
    const transactionId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);

    const newBooking = {
        id: Date.now(),
        transactionId,
        name,
        phone,
        location,
        type,
        date,
        time,
        hours,
        userId,
        paymentMethod,
        totalAmount,
        status: 'مؤكد ومدفوع'
    };

    BOOKINGS.push(newBooking);
    res.status(201).json({ 
        message: 'تم تأكيد حجزك بنجاح ومعالجة عملية الدفع الإلكتروني!',
        booking: newBooking
    });
});

// 5. حذف أو رفض الحجز من لوحة المالك
app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const index = BOOKINGS.findIndex(b => b.id === bookingId);
    
    if (index !== -1) {
        BOOKINGS.splice(index, 1);
        return res.json({ message: 'تم رفض وإلغاء الحجز بنجاح من قبل صاحب الملعب.' });
    } else {
        return res.status(404).json({ message: 'الحجز غير موجود أو تم إلغاؤه بالفعل.' });
    }
});

// 6. تحديث الأسعار للمالك
app.post('/api/prices', (req, res) => {
    const { location, hourlyRate, subRate } = req.body;
    OWNER_PRICES[location] = { hourlyRate, subRate };
    res.json({ message: 'تم تحديث خطط الأسعار والاشتراكات بنجاح!' });
});

// 7. جلب الأسعار الديناميكية للملاعب
app.get('/api/prices', (req, res) => {
    const location = req.query.location;
    if (location && OWNER_PRICES[location]) {
        return res.json(OWNER_PRICES[location]);
    }
    res.json({ hourlyRate: 150, subRate: 1000 });
});

// 8. إرسال وتقييم الآراء
app.post('/api/reviews', (req, res) => {
    const { name, review } = req.body;
    if (!review) return res.status(400).json({ message: 'الرجاء كتابة الرأي أولاً!' });
    
    const newReview = { id: Date.now(), name, review };
    REVIEWS.push(newReview);
    res.json({ message: 'شكراً لك على تقييمك الاحترافي!' });
});

app.get('/api/reviews', (req, res) => {
    res.json(REVIEWS);
});

app.listen(3000, () => console.log('السيرفر يعمل بنجاح على المنفذ 3000'));
