import { createScene } from './SceneManager.js';
import { AvatarHandler } from './AvatarHandler.js';
import * as THREE from 'three';

const { scene, camera, renderer, controls } = createScene('avatar-container');
const avatar = new AvatarHandler(scene);
const clock = new THREE.Clock();

// تحميل الموديل
avatar.loadModel('./assets/taste_model.glb')
    .then(() => console.log("Avatar Ready!"))
    .catch(err => console.error(err));

// ربط زر Create Avatar
document.getElementById('create-avatar-btn').addEventListener('click', () => {
    const h = document.getElementById('height').value;
    const w = document.getElementById('weight').value;
    
    fetch('http://127.0.0.1:5000/get_size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height: h, weight: w })
    })
    .then(res => res.json())
    .then(data => {
        avatar.updateFat(data.bmi); // تحديث الكرش برمجياً
        document.getElementById('outfit-name').innerText = "Size: " + data.size;
    });
});

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getElapsedTime();
    avatar.animate(delta); // تشغيل حركات الأفاتار
    controls.update();
    renderer.render(scene, camera);
}
animate();