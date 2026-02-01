# تعليمات النشر السريع على Vercel

## 1. تثبيت Vercel CLI
```bash
npm i -g vercel
```

## 2. النشر
```bash
cd backend
vercel --prod
```

## 3. إضافة متغيرات البيئة في Vercel Dashboard:
- `MONGODB_URI`: رابط قاعدة البيانات
- `JWT_SECRET`: مفتاح JWT
- `NODE_ENV`: production
- `FRONTEND_URL`: رابط الفرونت اند
- `ADMIN_URL`: رابط لوحة الإدارة

## 4. اختبار API:
- الرابط الأساسي: `https://your-project.vercel.app`
- اختبار الصحة: `https://your-project.vercel.app/api/health`

## ملاحظات مهمة:
- ✅ الملفات جاهزة للنشر
- ✅ تم إعداد vercel.json
- ✅ تم إعداد .vercelignore
- ⚠️ تأكد من إضافة متغيرات البيئة
- ⚠️ قد تحتاج لخدمة تخزين سحابية للصور (Cloudinary)