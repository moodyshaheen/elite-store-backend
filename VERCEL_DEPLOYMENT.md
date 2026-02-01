# نشر الباك اند على Vercel

## الخطوات المطلوبة:

### 1. تحضير المتغيرات البيئية
قم بإضافة المتغيرات التالية في إعدادات Vercel:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-frontend-domain.vercel.app
ADMIN_URL=https://your-admin-domain.vercel.app
```

### 2. رفع المشروع
```bash
# تأكد من وجود Vercel CLI
npm i -g vercel

# في مجلد backend
cd backend
vercel

# اتبع التعليمات لربط المشروع
```

### 3. إعدادات مهمة في Vercel Dashboard:
- **Build Command**: `npm install`
- **Output Directory**: `./`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 4. ملاحظات مهمة:
- تأكد من أن قاعدة البيانات MongoDB متاحة من الإنترنت
- قم بتحديث CORS origins في متغيرات البيئة
- الملفات المرفوعة (uploads) لن تعمل على Vercel - استخدم خدمة تخزين سحابية مثل Cloudinary

### 5. اختبار النشر:
بعد النشر، تأكد من:
- `GET /` - يجب أن يعرض رسالة ترحيب
- `GET /api/health` - يجب أن يعرض حالة الخادم
- اختبار API endpoints الأخرى

### 6. استكشاف الأخطاء:
- تحقق من logs في Vercel Dashboard
- تأكد من صحة متغيرات البيئة
- تأكد من اتصال قاعدة البيانات