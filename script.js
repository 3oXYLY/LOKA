/**
 * Vesto - Virtual Try On (Local Images Version)
 * الكود يعتمد الآن على المجلد المحلي لسهولة ربط وتغيير الصور
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. البيانات (Data Structure) ---
    // مصفوفة الملابس المركزية: تعتمد الآن على مجلد صور محلي (images/) من جهازك
    // يمكنك لاحقاً استبدال هذه الملفات بصورك الحقيقية (بصيغة png او jpg او غيرها)
    const clothingData = [
        { id: 'tshirt', name: 'T-Shirt', imgSrc: 'images/tshirt-overlay.svg' },
        { id: 'jacket', name: 'Jacket', imgSrc: 'images/jacket-overlay.svg' },
        { id: 'hoodie', name: 'Hoodie', imgSrc: 'images/hoodie-overlay.svg' },
        { id: 'shirt', name: 'Shirt', imgSrc: 'images/shirt-overlay.svg' }
    ];

    // --- 2. تحديد عناصر واجهة المستخدم (DOM Elements) ---
    const clothingOverlayImg = document.getElementById('clothing-overlay');
    const outfitNameDisplay = document.getElementById('outfit-name');
    const clothingItems = document.querySelectorAll('.clothing-item');
    const wearButtons = document.querySelectorAll('.wear-btn');

    const createAvatarBtn = document.getElementById('create-avatar-btn');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    // --- 3. المنطق الأساسي لتغيير الملابس (Clothing Logic) ---
    // دالة مسؤولة عن تغيير صورة الملابس المعروضة فوق الجسم مع عمل تأثير تلاشي (Fade)
    const changeClothingLayer = (clothingId, clothingName) => {
        const selectedCloth = clothingData.find(item => item.id === clothingId);
        
        if (selectedCloth) {
            clothingOverlayImg.classList.add('fade-out');
            clothingOverlayImg.classList.remove('fade-in');
            
            setTimeout(() => {
                // تحديث مسار الصورة ليكون الخاص بالقطعة المطلوبة من جهازك
                clothingOverlayImg.src = selectedCloth.imgSrc;
                
                clothingOverlayImg.classList.add('fade-in');
                clothingOverlayImg.classList.remove('fade-out');
            }, 200); 

            outfitNameDisplay.textContent = clothingName;
            
            outfitNameDisplay.style.transform = 'scale(1.15)';
            setTimeout(() => outfitNameDisplay.style.transform = 'scale(1)', 200);
        }
    };

    // --- 4. ربط تفاعل الماوس بالأزرار والبطاقات (Event Listeners) ---
    wearButtons.forEach((btn) => {
        btn.addEventListener('click', function(event) {
            event.stopPropagation(); 

            const currentItemCard = this.closest('.clothing-item');
            
            const itemId = currentItemCard.getAttribute('data-id');
            const itemName = currentItemCard.getAttribute('data-name');
            
            clothingItems.forEach(item => item.classList.remove('selected'));
            currentItemCard.classList.add('selected');
            
            changeClothingLayer(itemId, itemName);
        });
    });
    
    clothingItems.forEach(item => {
        item.addEventListener('click', function() {
            const btn = this.querySelector('.wear-btn');
            if(btn) btn.click();
        });
    });

    // --- 5. برمجة زر إنشاء/تحديث الأفاتار ---
    createAvatarBtn.addEventListener('click', () => {
        const heightVal = heightInput.value.trim();
        const weightVal = weightInput.value.trim();
        
        if (heightVal && weightVal) {
            console.log(`[Vesto] 🟢 Creating Avatar parameters updated...`);
            console.log(`[Vesto] Height: ${heightVal} cm`);
            console.log(`[Vesto] Weight: ${weightVal} kg`);
            
            const originalText = createAvatarBtn.textContent;
            createAvatarBtn.textContent = 'Avatar Saved!';
            createAvatarBtn.style.backgroundColor = '#10b981'; 
            
            setTimeout(() => {
                createAvatarBtn.textContent = originalText;
                createAvatarBtn.style.backgroundColor = ''; 
            }, 2000);
            
        } else {
            alert("Please enter both height and weight to create your avatar.");
            if (!heightVal) heightInput.focus();
            else if (!weightVal) weightInput.focus();
        }
    });

});
