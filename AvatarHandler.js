import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

export class AvatarHandler {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.avatar = null;
        this.bodyMesh = null;
    }

    loadModel(path) {
        return new Promise((resolve, reject) => {
            this.loader.load(path, (gltf) => {
                this.avatar = gltf.scene;
                this.avatar.scale.set(0.17, 0.17, 0.17);
                this.avatar.position.y = -0;

                this.avatar.traverse((child) => {
                    if (child.isMesh && child.morphTargetInfluences) {
                        this.bodyMesh = child; // الاحتفاظ بالجزء القابل للتعديل
                    }
                });

                this.scene.add(this.avatar);
                resolve(this.avatar);
            }, undefined, reject);
        });
    }

    updateFat(bmi) {
        if (!this.bodyMesh) return;
        const fatIndex = this.bodyMesh.morphTargetDictionary['Stomach_fat_high'];
        if (fatIndex !== undefined) {
            let influence = (bmi - 20) / 15;
            this.bodyMesh.morphTargetInfluences[fatIndex] = Math.min(Math.max(influence, 0), 1);
        }
    }

    animate(time) {
        if (this.avatar) {
            // حركة التنفس والطفو التي كانت في كودك القديم
            this.avatar.position.y = -0.5 + Math.sin(time * 2.5) * 0.15;
        }
    }
}