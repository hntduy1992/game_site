/**
 * HỆ THỐNG ĐỘNG VẬT 3D, NHÃN CHỮ CÁI NỔI & AI ĐI THEO DẪN ĐƯỜNG
 * Hoàn thành bài kiểm tra -> Động vật đi theo bé và dẫn đường tới con vật tiếp theo
 */

class AnimalManager {
    constructor(scene) {
        this.scene = scene;
        this.animals = [];
        this.followerOrder = []; // Danh sách các con vật đã hoàn thành bài kiểm tra và đi theo bé
        this.activeGuideAnimal = null; // Con vật đang dẫn đường phía trước
        this.heartParticles = [];

        this.spawnAllAnimals();
    }

    spawnAllAnimals() {
        window.GAME_DATA.animals.forEach((data, index) => {
            const animalObj = this.createAnimal3D(data, index);
            this.animals.push(animalObj);
        });
    }

    createAnimal3D(data, index) {
        const root = new THREE.Group();
        root.position.set(data.position.x, 0, data.position.z);

        const bodyGroup = new THREE.Group();
        root.add(bodyGroup);

        const mainMat = new THREE.MeshLambertMaterial({ color: data.color });
        const spotMat = new THREE.MeshLambertMaterial({ color: data.spotColor });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x2C3A47 });
        const whiteMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const pinkMat = new THREE.MeshLambertMaterial({ color: 0xFF9FF3 });

        // Thân chính
        const torsoGeo = new THREE.BoxGeometry(1.5, 1.05, 2.1);
        const torso = new THREE.Mesh(torsoGeo, mainMat);
        torso.position.y = 1.1;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Đầu
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.75, 1.05);

        let headGeo = new THREE.BoxGeometry(1.05, 0.95, 1.05);
        if (data.id === "rua_vang") {
            torso.scale.set(1.2, 0.65, 1.15);
            torso.position.y = 0.72;
            // Mai rùa
            const shellGeo = new THREE.SphereGeometry(1.15, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
            const shell = new THREE.Mesh(shellGeo, spotMat);
            shell.position.y = 0.78;
            bodyGroup.add(shell);
            headGroup.position.set(0, 0.95, 1.25);
        } else if (data.id === "huou_sao") {
            // Cổ cao cho Hươu cao cổ
            const neckGeo = new THREE.CylinderGeometry(0.28, 0.38, 1.8, 10);
            const neck = new THREE.Mesh(neckGeo, mainMat);
            neck.position.set(0, 2.15, 0.75);
            neck.rotation.x = 0.2;
            bodyGroup.add(neck);
            headGroup.position.set(0, 3.05, 1.0);
        } else if (data.id === "ga_trong") {
            torso.scale.set(0.75, 0.85, 0.75);
            headGroup.position.set(0, 1.65, 0.65);
        }

        const headMesh = new THREE.Mesh(headGeo, mainMat);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // Đôi mắt to tròn dễ thương
        const eyeGeo = new THREE.SphereGeometry(0.14, 10, 10);
        const pupilGeo = new THREE.SphereGeometry(0.08, 8, 8);

        const leftEye = new THREE.Mesh(eyeGeo, whiteMat);
        leftEye.position.set(-0.28, 0.12, 0.52);
        const leftPupil = new THREE.Mesh(pupilGeo, darkMat);
        leftPupil.position.set(-0.28, 0.12, 0.62);

        const rightEye = new THREE.Mesh(eyeGeo, whiteMat);
        rightEye.position.set(0.28, 0.12, 0.52);
        const rightPupil = new THREE.Mesh(pupilGeo, darkMat);
        rightPupil.position.set(0.28, 0.12, 0.62);

        headGroup.add(leftEye, leftPupil, rightEye, rightPupil);

        // Đặc điểm riêng từng loài động vật
        if (data.id === "bo_sua") {
            // Mõm hồng + Sừng + Đốm đen
            const snout = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.35), pinkMat);
            snout.position.set(0, -0.15, 0.52);
            headGroup.add(snout);

            const hornGeo = new THREE.ConeGeometry(0.12, 0.42, 8);
            const lHorn = new THREE.Mesh(hornGeo, spotMat);
            lHorn.position.set(-0.4, 0.62, 0);
            const rHorn = new THREE.Mesh(hornGeo, spotMat);
            rHorn.position.set(0.4, 0.62, 0);
            headGroup.add(lHorn, rHorn);

            // Đốm bò sữa trên lưng
            const spot1 = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.5, 0.7), spotMat);
            spot1.position.set(0, 1.35, -0.2);
            bodyGroup.add(spot1);
        } else if (data.id === "tho_trang") {
            // Tai thỏ dài
            const earGeo = new THREE.CylinderGeometry(0.14, 0.16, 1.15, 10);
            const lEar = new THREE.Mesh(earGeo, mainMat);
            lEar.position.set(-0.28, 0.9, 0);
            const rEar = new THREE.Mesh(earGeo, mainMat);
            rEar.position.set(0.28, 0.9, 0);
            headGroup.add(lEar, rEar);

            const nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), pinkMat);
            nose.position.set(0, -0.05, 0.56);
            headGroup.add(nose);
        } else if (data.id === "voi_con") {
            // Vòi voi dài & tai to
            const trunkGeo = new THREE.CylinderGeometry(0.18, 0.13, 1.1, 10);
            const trunk = new THREE.Mesh(trunkGeo, mainMat);
            trunk.position.set(0, -0.35, 0.72);
            trunk.rotation.x = 0.55;
            headGroup.add(trunk);

            const bigEarGeo = new THREE.BoxGeometry(0.75, 0.85, 0.12);
            const lEar = new THREE.Mesh(bigEarGeo, spotMat);
            lEar.position.set(-0.78, 0, 0);
            const rEar = new THREE.Mesh(bigEarGeo, spotMat);
            rEar.position.set(0.78, 0, 0);
            headGroup.add(lEar, rEar);
        } else if (data.id === "ga_trong") {
            // Mào đỏ & mỏ vàng
            const comb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.65), mainMat);
            comb.position.set(0, 0.62, 0);
            headGroup.add(comb);

            const beak = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), spotMat);
            beak.rotation.x = Math.PI / 2;
            beak.position.set(0, -0.05, 0.68);
            headGroup.add(beak);
        } else if (data.id === "meo_hoa" || data.id === "cun_con") {
            // Đôi tai nhọn / cụp đáng yêu
            const earGeo = new THREE.ConeGeometry(0.24, 0.48, 6);
            const lEar = new THREE.Mesh(earGeo, spotMat);
            lEar.position.set(-0.35, 0.64, 0);
            const rEar = new THREE.Mesh(earGeo, spotMat);
            rEar.position.set(0.35, 0.64, 0);
            headGroup.add(lEar, rEar);
        }

        bodyGroup.add(headGroup);

        // 4 Chân chuyển động
        const legs = [];
        const legGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.75, 10);
        const legOffsets = [
            { x: -0.48, z: 0.68 },
            { x: 0.48, z: 0.68 },
            { x: -0.48, z: -0.68 },
            { x: 0.48, z: -0.68 }
        ];
        legOffsets.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, spotMat);
            leg.position.set(pos.x, 0.38, pos.z);
            leg.castShadow = true;
            bodyGroup.add(leg);
            legs.push(leg);
        });

        // Đuôi vẫy
        const tailGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.75, 8);
        const tail = new THREE.Mesh(tailGeo, spotMat);
        tail.position.set(0, 1.25, -1.15);
        tail.rotation.x = -0.6;
        bodyGroup.add(tail);

        // Vòng tròn phát sáng dưới chân con vật
        const ringGeo = new THREE.RingGeometry(1.45, 1.85, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xFFD166,
            side: THREE.DoubleSide
        });
        const baseRing = new THREE.Mesh(ringGeo, ringMat);
        baseRing.rotation.x = -Math.PI / 2;
        baseRing.position.y = 0.06;
        root.add(baseRing);

        // Bảng chữ cái & Tên lơ lửng trên đầu (Billboard Sprite)
        const labelSprite = this.createOverheadSprite(data, false);
        labelSprite.position.set(0, data.id === "huou_sao" ? 4.6 : 3.4, 0);
        root.add(labelSprite);

        // Hitbox tàng hình to rõ giúp bé 6 tuổi click chuột trái/phải cực nhạy
        const hitboxGeo = new THREE.CylinderGeometry(1.9, 1.9, 3.6, 16);
        const hitboxMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.0,
            depthWrite: false
        });
        const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
        hitbox.position.y = 1.8;
        root.add(hitbox);

        const animalInstance = {
            index,
            data,
            root,
            bodyGroup,
            headGroup,
            legs,
            tail,
            baseRing,
            labelSprite,
            hitbox,
            completed: false,
            celebrationTimer: 0
        };

        // Gắn tham chiếu vào tất cả các mesh con để Raycaster nhận diện ngay lập tức
        root.traverse(obj => {
            obj.userData = {
                type: "animal",
                animalInstance
            };
        });

        this.scene.add(root);
        return animalInstance;
    }

    createOverheadSprite(data, isCompleted) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 256;
        this.drawLabelCanvas(canvas, data, isCompleted);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(3.8, 1.9, 1);
        sprite.userData.canvas = canvas;
        sprite.userData.texture = texture;
        return sprite;
    }

    drawLabelCanvas(canvas, data, isCompleted) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Khung nền bo tròn
        ctx.fillStyle = isCompleted ? "rgba(16, 172, 132, 0.95)" : "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = isCompleted ? "#FFFFFF" : "#FFA502";
        ctx.lineWidth = 10;

        const r = 36;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(16, 16, 480, 210, r);
        } else {
            ctx.rect(16, 16, 480, 210);
        }
        ctx.fill();
        ctx.stroke();

        // Chữ cái lớn nổi bật
        ctx.fillStyle = isCompleted ? "#FFEAA7" : "#EE5253";
        ctx.font = "900 78px 'Baloo 2', 'Nunito', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${data.emoji} ${data.letterUpper} ${data.letterLower}`, 256, 108);

        // Tên con vật & trạng thái
        ctx.fillStyle = isCompleted ? "#FFFFFF" : "#2C3A47";
        ctx.font = "800 38px 'Nunito', sans-serif";
        const statusText = isCompleted ? `✅ ${data.name} (Bạn đồng hành)` : `⭐ ${data.name} - Click học bài`;
        ctx.fillText(statusText, 256, 178);
    }

    /**
     * Đánh dấu con vật đã hoàn thành bài kiểm tra -> Đi theo bé và dẫn đường
     */
    markAnimalCompleted(animalInstance) {
        if (!animalInstance.completed) {
            animalInstance.completed = true;
            this.followerOrder.push(animalInstance);

            // Cập nhật bảng tên trên đầu sang màu xanh lá "Bạn đồng hành"
            const sprite = animalInstance.labelSprite;
            this.drawLabelCanvas(sprite.userData.canvas, animalInstance.data, true);
            sprite.userData.texture.needsUpdate = true;

            // Đổi màu vòng tròn dưới chân
            animalInstance.baseRing.material.color.setHex(0x10AC84);
        }

        // Đặt con vật này làm người dẫn đường tích cực tới con vật tiếp theo
        this.activeGuideAnimal = animalInstance;
        animalInstance.celebrationTimer = 2.8;
        this.spawnCelebrationBurst(animalInstance.root.position);
    }

    /**
     * Tìm con vật gần nhất chưa hoàn thành bài kiểm tra để dẫn đường tới
     */
    getNextUncompletedAnimal(fromPos) {
        const uncompleted = this.animals.filter(a => !a.completed);
        if (uncompleted.length === 0) return null;

        let best = uncompleted[0];
        let minDist = Infinity;
        uncompleted.forEach(a => {
            const d = Math.hypot(
                a.root.position.x - fromPos.x,
                a.root.position.z - fromPos.z
            );
            if (d < minDist) {
                minDist = d;
                best = a;
            }
        });
        return best;
    }

    /**
     * Hiệu ứng pháo hoa ngôi sao / trái tim bay lên khi bé tương tác hoặc hoàn thành bài học
     */
    spawnCelebrationBurst(position) {
        const colors = [0xFF6B6B, 0xFFD166, 0x4ECDC4, 0xFF9FF3, 0x1DD1A1];
        for (let i = 0; i < 18; i++) {
            const geo = new THREE.OctahedronGeometry(0.22, 0);
            const mat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length]
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.set(position.x, position.y + 1.8, position.z);
            this.scene.add(p);

            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3.5;
            this.heartParticles.push({
                mesh: p,
                vx: Math.cos(angle) * speed,
                vy: 3.5 + Math.random() * 3.5,
                vz: Math.sin(angle) * speed,
                life: 1.4
            });
        }
    }

    /**
     * Cập nhật hoạt ảnh 3D, AI đi theo người chơi & AI dẫn đường đến con vật tiếp theo
     */
    update(dt, elapsedTime, playerPos, playerForward) {
        const nextTargetAnimal = this.getNextUncompletedAnimal(playerPos);

        this.animals.forEach((animal, idx) => {
            let isMoving = false;

            if (animal.completed) {
                // Nếu là con vật dẫn đường (activeGuideAnimal) và vẫn còn con vật chưa học:
                // Con vật này sẽ chạy lên phía trước người chơi khoảng 4.8m hướng về phía con vật tiếp theo!
                if (animal === this.activeGuideAnimal && nextTargetAnimal) {
                    const dirToNextX = nextTargetAnimal.root.position.x - playerPos.x;
                    const dirToNextZ = nextTargetAnimal.root.position.z - playerPos.z;
                    const len = Math.hypot(dirToNextX, dirToNextZ) || 1;
                    const normX = dirToNextX / len;
                    const normZ = dirToNextZ / len;

                    const guideDistance = Math.min(5.2, len * 0.45);
                    const desiredX = playerPos.x + normX * guideDistance;
                    const desiredZ = playerPos.z + normZ * guideDistance;

                    const dx = desiredX - animal.root.position.x;
                    const dz = desiredZ - animal.root.position.z;
                    const dist = Math.hypot(dx, dz);

                    if (dist > 0.45) {
                        isMoving = true;
                        const moveSpeed = Math.min(7.5, 3.8 + dist * 0.9);
                        animal.root.position.x += (dx / dist) * moveSpeed * dt;
                        animal.root.position.z += (dz / dist) * moveSpeed * dt;
                        animal.bodyGroup.rotation.y = Math.atan2(dx, dz);
                    } else {
                        // Khi đã đứng đợi ở phía trước, quay đầu nhìn về phía con vật mục tiêu và vẫy gọi bé
                        const lookX = nextTargetAnimal.root.position.x - animal.root.position.x;
                        const lookZ = nextTargetAnimal.root.position.z - animal.root.position.z;
                        animal.bodyGroup.rotation.y = Math.atan2(lookX, lookZ);
                    }
                } else {
                    // Các bạn động vật đã hoàn thành khác xếp hàng nối đuôi đi theo sau lưng người chơi
                    const rankIndex = this.followerOrder.indexOf(animal);
                    const followDist = 3.4 + rankIndex * 2.5;
                    const sideOffset = (rankIndex % 2 === 0 ? 1 : -1) * 1.1;

                    const desiredX =
                        playerPos.x - playerForward.x * followDist + playerForward.z * sideOffset;
                    const desiredZ =
                        playerPos.z - playerForward.z * followDist - playerForward.x * sideOffset;

                    const dx = desiredX - animal.root.position.x;
                    const dz = desiredZ - animal.root.position.z;
                    const dist = Math.hypot(dx, dz);

                    if (dist > 0.6) {
                        isMoving = true;
                        const speed = Math.min(7.2, 3.2 + dist * 0.85);
                        animal.root.position.x += (dx / dist) * speed * dt;
                        animal.root.position.z += (dz / dist) * speed * dt;
                        animal.bodyGroup.rotation.y = Math.atan2(dx, dz);
                    } else {
                        // Nhìn về phía người chơi
                        const toPlayerX = playerPos.x - animal.root.position.x;
                        const toPlayerZ = playerPos.z - animal.root.position.z;
                        animal.bodyGroup.rotation.y = Math.atan2(toPlayerX, toPlayerZ);
                    }
                }
            } else {
                // Con vật chưa học: Đứng tại khu vực của mình và quay mặt chào khi bé lại gần
                const toPlayerX = playerPos.x - animal.root.position.x;
                const toPlayerZ = playerPos.z - animal.root.position.z;
                const distToPlayer = Math.hypot(toPlayerX, toPlayerZ);

                if (distToPlayer < 16) {
                    const targetYaw = Math.atan2(toPlayerX, toPlayerZ);
                    animal.bodyGroup.rotation.y = THREE.MathUtils.lerp(
                        animal.bodyGroup.rotation.y,
                        targetYaw,
                        dt * 4
                    );
                } else {
                    animal.bodyGroup.rotation.y = Math.sin(elapsedTime * 0.5 + idx) * 0.6;
                }

                // Làm nổi bật vòng sáng của con vật mục tiêu tiếp theo
                if (animal === nextTargetAnimal) {
                    const pulse = 1 + Math.sin(elapsedTime * 6) * 0.18;
                    animal.baseRing.scale.set(pulse, pulse, 1);
                    animal.baseRing.material.color.setHex(
                        Math.floor(elapsedTime * 4) % 2 === 0 ? 0xFF6B6B : 0xFFD166
                    );
                } else {
                    animal.baseRing.scale.set(1, 1, 1);
                    animal.baseRing.material.color.setHex(0xFFD166);
                }
            }

            // Hoạt ảnh bước chân, nhún nhảy & vẫy đuôi
            if (animal.celebrationTimer > 0) {
                animal.celebrationTimer -= dt;
                animal.bodyGroup.position.y = Math.abs(Math.sin(elapsedTime * 12)) * 0.85;
                animal.bodyGroup.rotation.y += dt * 5;
            } else if (isMoving) {
                animal.bodyGroup.position.y = Math.abs(Math.sin(elapsedTime * 10 + idx)) * 0.22;
                animal.legs.forEach((leg, lIdx) => {
                    const sign = lIdx % 2 === 0 ? 1 : -1;
                    leg.rotation.x = Math.sin(elapsedTime * 12 + idx) * 0.45 * sign;
                });
            } else {
                animal.bodyGroup.position.y = Math.sin(elapsedTime * 2.5 + idx) * 0.05;
                animal.legs.forEach(leg => {
                    leg.rotation.x = 0;
                });
            }

            animal.tail.rotation.z = Math.sin(elapsedTime * 8 + idx) * 0.35;
        });

        // Cập nhật hạt pháo hoa chúc mừng
        for (let i = this.heartParticles.length - 1; i >= 0; i--) {
            const p = this.heartParticles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.heartParticles.splice(i, 1);
            } else {
                p.vy -= 9.8 * dt;
                p.mesh.position.x += p.vx * dt;
                p.mesh.position.y += p.vy * dt;
                p.mesh.position.z += p.vz * dt;
                p.mesh.rotation.y += 4 * dt;
                p.mesh.scale.setScalar(Math.max(0.1, p.life));
            }
        }
    }
}

window.AnimalManager = AnimalManager;
