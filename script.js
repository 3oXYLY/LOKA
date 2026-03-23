/**
 * Vesto - Virtual Try On (3D Version via Three.js)
 * الكود يعتمد على Three.js لإنشاء بيئة ثلاثية الأبعاد تحتوي على مجسم (مانيكان)
 * مع عرض رسومات مُنّشأة تلقائياً (Canvas Textures) لتعمل بنسبة 100% دون أخطاء حماية!
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. تحديد عناصر واجهة المستخدم الثنائية (DOM Elements) ---
    const avatarContainer = document.getElementById('avatar-container');
    const outfitNameDisplay = document.getElementById('outfit-name');
    const clothingItems = document.querySelectorAll('.clothing-item');
    const wearButtons = document.querySelectorAll('.wear-btn');

    const createAvatarBtn = document.getElementById('create-avatar-btn');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');


    // --- 2. متغيرات أساسية للبيئة ثلاثية الأبعاد والمجسمات ---
    let scene, camera, renderer, controls;
    let avatarGroup; 
    let currentClothingMesh = null; 
    let avatarBodyMesh = null; // متغير للتحكم بـ (جذع) الأفاتار الذكي وإخفاءه
    
    // مخزن (كائن/Object) لقطع الملابس الهندسية المجسمة
    const clothingModels = {};

    function init3D() {
        scene = new THREE.Scene();

        const width = avatarContainer.clientWidth || 300;
        const height = avatarContainer.clientHeight || 450;
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 5, 20); 

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        avatarContainer.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(10, 15, 10);
        scene.add(directionalLight);

        avatarGroup = new THREE.Group();

        const skinMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe2e8f0, 
            roughness: 0.6, 
            metalness: 0.1 
        });

        // الرأس
        const headGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 6.5; 
        avatarGroup.add(head);

        // الجذع
        const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.4, 6, 32);
        avatarBodyMesh = new THREE.Mesh(bodyGeometry, skinMaterial);
        avatarBodyMesh.position.y = 2.5; 
        avatarGroup.add(avatarBodyMesh);

        // المنصة الارضية
        const baseGeometry = new THREE.CylinderGeometry(3.5, 3.5, 0.5, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.7;
        scene.add(base);

        scene.add(avatarGroup);


        // --- 6. الحل الجذري للمبتدئين: بناء الخامات برمجياً (Procedural Textures) ---
        // بدلاً من استدعاء صور خارجية والوقوع في أخطاء CORS أو مسارات مفقودة، 
        // سننشئ خامات الأقمشة مباشرة بواسطة الرسم بالكانفاس (HTML Canvas) لكي تعمل فوراً وفي أي مكان!
        
        function createFabricTexture(type, baseColorHex, patternColorHex) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // تلوين الخلفية
            ctx.fillStyle = '#' + baseColorHex.toString(16).padStart(6, '0');
            ctx.fillRect(0, 0, 256, 256);
            
            // لون النقشة
            ctx.fillStyle = '#' + patternColorHex.toString(16).padStart(6, '0');
            ctx.strokeStyle = '#' + patternColorHex.toString(16).padStart(6, '0');
            
            if (type === 'dots') { // مسامات القطن للتيشيرت
                for (let x = 0; x < 256; x += 16) {
                    for (let y = 0; y < 256; y += 16) {
                        ctx.beginPath();
                        ctx.arc(x + 4, y + 4, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else if (type === 'lines') { // نسيج مائل للجاكيت
                ctx.lineWidth = 4;
                for (let i = -256; i < 512; i += 24) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i + 256, 256);
                    ctx.stroke();
                }
            } else if (type === 'checkers') { // كاروهات للقميص
                for (let x = 0; x < 256; x += 32) {
                    for (let y = 0; y < 256; y += 32) {
                        if ((x / 32) % 2 === Math.floor(y / 32) % 2) {
                            ctx.fillRect(x, y, 32, 32);
                        }
                    }
                }
            } else if (type === 'fleece') { // دوائر كثيفة للصوف (الهودي)
                for (let i = 0; i < 800; i++) {
                    ctx.beginPath();
                    ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 4 + 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // تحويل الكانفاس إلى خامة 3D صالحة للاستخدام من مكاتب ثري دي جي اس
            const texture = new THREE.CanvasTexture(canvas);
            // ضبط طريقة تكرار الصورة المطبوعة (Texture Wrapping)
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            return texture;
        }

        // إنشاء المجسمات باستخدام الخامات البرمجية המضمونة بنسبة 100%
        
        // أ. التي-شيرت (T-Shirt) بواقعية 3D حقيقية باستخدام OBJLoader
        const tshirtTex = createFabricTexture('dots', 0x3b82f6, 0x2563eb);
        tshirtTex.repeat.set(4, 2);
        const tshirtMat = new THREE.MeshStandardMaterial({ 
            map: tshirtTex, 
            roughness: 0.9, 
            color: 0xffffff,
            side: THREE.DoubleSide // مهم جداً للملابس لكي تُطلى من الداخل والخارج
        }); 

        // 1. مجسم احتياطي مؤقت ريثما يتم تحميل الملف الحقيقي ذو الجودة العالية
        const placeholderGeo = new THREE.CylinderGeometry(1.55, 1.45, 3.5, 32);
        clothingModels['tshirt'] = new THREE.Mesh(placeholderGeo, tshirtMat);
        clothingModels['tshirt'].position.y = 3.6;

        // 2. تحميل المجسم الحقيقي بصيغة (GLB / GLTF) من المجلد 
        // ملاحظة: لقد استخدمنا مجسم "بطة 3D" (Duck.glb) لغرض الاختبار المؤقت لضمان عمل نظام GLTF
        // وذلك لأن أغلب مواقع الملابس 3D الجاهزة والمجانية تتطلب إنشاء حساب لتنزيلها ولا يمكن سحبها بالكود.
        // بمجرد أن تنزل ملفك الخاص من الإنترنت (مثل Sketchfab)، ضعه في المجلد وسمه tshirt.glb !
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(
            'models/tshirt.glb',
            function (gltf) {
                const object = gltf.scene; // استخراج المشهد من ملف الـ GLTF
                
                // إيقاف إكساء المجسم باللون الأزرق الإجباري حتى تظهر الألوان والتفاصيل الأصلية لملفك!
                // قمنا بتهميش الكود بوضع (/* */) لكي لا يطغى على لون التيشيرت الحقيقي
                /*
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = tshirtMat;
                    }
                });
                */
                
                // نظام برمجي ذكي لضبط حجم أي مجسم تحمله من الإنترنت تلقائياً
                // (لأن المجسمات تختلف أحجامها، بعضها عملاق وبعضها صغير جداً)
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                
                if(maxDim > 0) {
                    const scaleFactor = 4.0 / maxDim; // جعل حجم المجسم يناسب حجم صدر الأفاتار (4 وحدات تقريباً)
                    object.scale.set(scaleFactor, scaleFactor, scaleFactor);
                }
                
                // توسيط المجسم بدقة ليكون على الأفاتار
                object.position.set(0, 3.5, 0); // 3.5 هو ارتفاع الصدر في الأفاتار
                
                // استبدال القطعة القديمة (الأسطوانة) بالحديثة
                const oldMesh = clothingModels['tshirt'];
                clothingModels['tshirt'] = object;
                
                // تحديث مباشر في حال كان المستخدم قد ضغط على لبس القطعة أثناء بدء التحميل
                if (currentClothingMesh === oldMesh && avatarGroup) {
                    avatarGroup.remove(oldMesh);
                    avatarGroup.add(object);
                    currentClothingMesh = object;
                }
            },
            undefined, // مكان لدالة اختيارية تُظهر الـ Loading bar (%)
            function (error) {
                console.error('يوجد خطأ في استدعاء ملف الـ 3D:', error);
            }
        );

        // ب. الجاكيت (Jacket)
        const jacketGeo = new THREE.CylinderGeometry(1.65, 1.55, 4.5, 32);
        const jacketTex = createFabricTexture('lines', 0x10b981, 0x059669);
        jacketTex.repeat.set(3, 3);
        const jacketMat = new THREE.MeshStandardMaterial({ map: jacketTex, roughness: 0.6, color: 0xffffff });
        const jacketMesh = new THREE.Mesh(jacketGeo, jacketMat);
        jacketMesh.position.y = 3.1; 
        clothingModels['jacket'] = jacketMesh;

        // ج. الهودي (Hoodie)
        const hoodieGeo = new THREE.CylinderGeometry(1.7, 1.6, 4, 32);
        const hoodieTex = createFabricTexture('fleece', 0x8b5cf6, 0x7c3aed);
        hoodieTex.repeat.set(4, 4);
        const hoodieMat = new THREE.MeshStandardMaterial({ map: hoodieTex, roughness: 1.0, color: 0xffffff });
        const hoodieMesh = new THREE.Mesh(hoodieGeo, hoodieMat);
        hoodieMesh.position.y = 3.5; 
        
        // قبعة الهودي
        const hoodGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const hood = new THREE.Mesh(hoodGeo, hoodieMat);
        hood.position.set(0, 2.5, -0.6); 
        hoodieMesh.add(hood); 
        clothingModels['hoodie'] = hoodieMesh;

        // د. القميص (Shirt)
        const shirtGeo = new THREE.CylinderGeometry(1.53, 1.42, 4, 32);
        const shirtTex = createFabricTexture('checkers', 0xf59e0b, 0xd97706);
        shirtTex.repeat.set(4, 4);
        const shirtMat = new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.85, color: 0xffffff });
        const shirtMesh = new THREE.Mesh(shirtGeo, shirtMat);
        shirtMesh.position.y = 3.5; 
        clothingModels['shirt'] = shirtMesh;


        // 7. تفعيل تحكم الماوس (OrbitControls)
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 3.5, 0); 
        controls.enableDamping = true; 
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 35;
        controls.maxPolarAngle = Math.PI / 2; 

        controls.update();

        // الدخول في دورة التحديث
        animate();
    }

    // دالة الرسم المستمرة (Loop)
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // استمرار تنعيم حركة الكاميرا
        renderer.render(scene, camera);
    }

    // تشغيل الكود وتأسيس الـ 3D
    if(typeof THREE !== 'undefined') {
        // إنشاء المشروع 
        init3D();
        
        // 🌟 ميزة جديدة لم تكن موجودة: 
        // سنقوم بجعل الأفاتار يلبس التي-شيرت الافتراضي تلقائياً عند فتح الصفحة!
        // ننتظر 100 جزء من الثانية لنتأكد من اكتمال رسم المتصفح
        setTimeout(() => {
            if(clothingItems.length > 0) {
                // تظليل الزر الأول في القائمة
                clothingItems[0].classList.add('selected');
                
                // تفعيل أمر التلبيس
                const itemId = clothingItems[0].getAttribute('data-id');
                const itemName = clothingItems[0].getAttribute('data-name');
                wearClothing3D(itemId, itemName);
            }
        }, 100);

    } else {
        console.error("Three.js library is not loaded.");
        avatarContainer.innerHTML = "<p>Please ensure internet connection to load 3D libraries.</p>";
    }


    window.addEventListener('resize', () => {
        if (!camera || !renderer) return;
        const width = avatarContainer.clientWidth;
        const height = avatarContainer.clientHeight;
        
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    
    // --- 3. المنطق التفاعلي لتغيير الملابس ---
    // تم تعريف الدالة خارج init3D لكي تكون متاحة، ولكننا نراقب جاهزية avatarGroup
    function wearClothing3D(itemId, itemName) {
        if (!avatarGroup) return; 
        
        // إزالة الملابس القديمة قبل إضافة الجديدة
        if (currentClothingMesh) {
            avatarGroup.remove(currentClothingMesh);
        }

        const selectedClothingMesh = clothingModels[itemId];
        
        if (selectedClothingMesh) {
            avatarGroup.add(selectedClothingMesh);
            currentClothingMesh = selectedClothingMesh;
            
            // 🥷 ميزة إخفاء/تقليص جسم الأفاتار الذكي لمنع اختراق الملابس (Clipping)
            if (avatarBodyMesh) {
                // نظراً لأن المجسم الذي أحضرته عبارة عن لوح مسطح وليس له تجويف ليلبسه الأفاتار،
                // قمنا الآن بإخفاء بطن الأفاتار بالكامل بدلاً من مجرد تقليصه، لكي لا تبرز الصورة أمامه!
                avatarBodyMesh.visible = false; 
            }
            
            outfitNameDisplay.textContent = itemName;
            outfitNameDisplay.style.transform = 'scale(1.15)';
            setTimeout(() => outfitNameDisplay.style.transform = 'scale(1)', 200);
        }
    }


    // --- 4. أحداث الأزرار (UI Events) ---
    wearButtons.forEach((btn) => {
        btn.addEventListener('click', function(event) {
            event.stopPropagation(); 
            const currentItemCard = this.closest('.clothing-item');
            const itemId = currentItemCard.getAttribute('data-id');
            const itemName = currentItemCard.getAttribute('data-name');
            
            clothingItems.forEach(item => item.classList.remove('selected'));
            currentItemCard.classList.add('selected');
            
            wearClothing3D(itemId, itemName);
        });
    });
    
    clothingItems.forEach(item => {
        item.addEventListener('click', function() {
            const btn = this.querySelector('.wear-btn');
            if(btn) btn.click(); // يحاكي النقر على الزر لتسهيل الاستخدام
        });
    });

    
    // --- 5. زر الأفاتار ---
    createAvatarBtn.addEventListener('click', () => {
        const heightVal = heightInput.value.trim();
        const weightVal = weightInput.value.trim();
        
        if (heightVal && weightVal) {
            const originalText = createAvatarBtn.textContent;
            createAvatarBtn.textContent = 'Avatar Configured!';
            createAvatarBtn.style.backgroundColor = '#10b981'; 
            
            setTimeout(() => {
                createAvatarBtn.textContent = originalText;
                createAvatarBtn.style.backgroundColor = ''; 
            }, 2000);
        } else {
            alert("Please enter both height and weight to configure your 3D avatar.");
        }
    });

});
