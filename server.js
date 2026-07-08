const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory database
const USERS = []; 
const BOOKINGS = []; 
const REVIEWS = [];
const OWNER_PRICES = {}; 

// 1. Register Route
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

// 2. Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username);

    if (!user) return res.status(400).json({ message: 'اسم المستخدم غير موجود بالنظام!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'كلمة المرور التي أدخلتها خاطئة!' });

    res.json({
        message: 'تم تسجيل الدخول بنجاح',
        user: { id: user.id, username: user.username, role: user.role, location: user.location }
    });
});

// 3. Create Booking Route (With Conflict Check & Hours Selection)
app.post('/api/bookings', (req, res) => {
    const { playerName, phone, fieldType, date, time, hours, location, userId } = req.body;
    
    // Check for conflicting bookings (First-come, First-served based on Location, FieldType, Date, and Time)
    const hasConflict = BOOKINGS.find(b => 
        b.location === location && 
        b.fieldType === fieldType && 
        b.date === date && 
        b.time === time
    );

    if (hasConflict) {
        return res.status(400).json({ message: 'عفواً، هذا الموعد محجوز مسبقاً لشخص آخر. الحجز بأسبقية الطلب!' });
    }

    const newBooking = { 
        id: Date.now(), 
        playerName, 
        phone, 
        fieldType, 
        date, 
        time, 
        hours: hours || 1,
        location, 
        userId 
    };
    BOOKINGS.push(newBooking);
    res.status(201).json({ message: 'تم تسجيل حجزك بنجاح وسوف يظهر لصاحب الملعب!', booking: newBooking });
});

// 4. Get Bookings Route (Filtered by Owner Location)
app.get('/api/bookings', (req, res) => {
    const ownerLocation = req.query.location;
    if (ownerLocation) {
        return res.json(BOOKINGS.filter(b => b.location === ownerLocation));
    }
    res.json(BOOKINGS);
});

// 5. Owner Delete/Reject Booking Route
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

// 6. Owner Price Update Route
app.post('/api/prices', (req, res) => {
    const { location, hourlyRate, subRate } = req.body;
    OWNER_PRICES[location] = { hourlyRate, subRate };
    res.json({ message: 'تم تحديث خطط الأسعار والاشتراكات الخاصة بملاعبك بنجاح!' });
});

// 7. Dynamic Price Fetch Route
app.get('/api/prices', (req, res) => {
    const location = req.query.location;
    if (location && OWNER_PRICES[location]) {
        return res.json(OWNER_PRICES[location]);
    }
    // Default prices if not customized yet
    res.json({ hourlyRate: 150, subRate: 1000 });
});

// 8. Submit Review Route
app.post('/api/reviews', (req, res) => {
    const { name, review } = req.body;
    if (!review) return res.status(400).json({ message: 'الرجاء كتابة الرأي أولاً!' });
    
    const newReview = { id: Date.now(), name: name || 'لاعب مجهول', review };
    REVIEWS.push(newReview);
    res.status(201).json({ message: 'شكراً لمشاركتنا رأيك القيم!' });
});

// 9. Get Reviews Route
app.get('/api/reviews', (req, res) => {
    res.json(REVIEWS);
});

app.listen(3000, () => {
    console.log('سيرفر Kick Off يعمل بنجاح الآن على الرابط: http://localhost:3000');
});