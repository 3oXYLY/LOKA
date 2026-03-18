/**
 * هذا الملف يحتوي على التفاعلات البرمجية (JavaScript)
 * هنا نستخدم لغة JS الخالصة (Vanilla JS) وسنشرح الخطوات.
 */

// ننتظر حتى يتم تحميل محتوى الصفحة بالكامل قبل تشغيل الأكواد
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. إضافة تأثير لتغيير لون شريط التنقل (Header) عند التمرير لأسفل (Scroll)
    // نبحث عن عنصر الـ header في الصفحة
    const header = document.querySelector('header');

    // نضيف مستمع أحداث لمراقبة حركة التمرير (Scroll) في النافذة
    window.addEventListener('scroll', () => {
        // إذا قام المستخدم بالتمرير أكثر من 50 بكسل
        if (window.scrollY > 50) {
            // نضيف ظل خفيف وقوة للون الخلفية لتمييز الشريط
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
        } else {
            // إذا رجع الماوس للأعلى (أقل من 50 بكسل)، نعيد التصميم لحالته الأصلية الزجاجية
            header.style.background = 'rgba(250, 250, 250, 0.85)';
            header.style.boxShadow = 'none';
        }
    });

    // 2. التحكم في أزرار "أضف إلى السلة" الخاصة بالمنتجات
    // نبحث عن كل الأزرار التي تملك تصنيف .add-to-cart-btn
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');

    // نمر على كل زر باستخدام حلقة تكرار (forEach)
    cartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // e.preventDefault() تمنع أي سلوك افتراضي للزر (لو كان رابطاً مثلاً)
            e.preventDefault();
            
            // تغيير النص من "أضف إلى السلة" إلى "تمت الإضافة!" لفترة قصيرة
            const originalText = button.textContent;
            button.textContent = 'تمت الإضافة! ✓';
            button.style.backgroundColor = '#4caf50'; // اللون الأخضر للدلالة على النجاح
            button.style.color = '#fff';

            // نعيد نص ولون الزر بعد ثانيتين (2000 ملي ثانية)
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = ''; // إعادة لون البطاقة الافتراضي
            }, 2000);
            
            // هنا في المستقبل سيتم إضافة الكود الحقيقي الخاص بحفظ المنتج في سلة التسوق
            console.log("تمت إضافة منتج للسلة بنجاح!");
        });
    });
});
