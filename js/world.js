/**
 * XÂY DỰNG THẾ GIỚI CÔNG VIÊN 3D RỘNG LỚN (WORLD BUILDER)
 * Bao gồm: Mặt đất, đường dạo bộ, hồ nước, cổng chào, cây cối, hoa lá, mây trời, bướm bay & vệt sáng dẫn đường
 */

class ParkWorld {
    constructor(scene) {
        this.scene = scene;
        this.clouds = [];
        this.butterflies = [];
        this.guideBeacons = [];
        this.interactableProps = [];
        this.treeColliders = []; // Lưu bán kính gốc cây để tránh đi xuyên thân cây lớn

        this.buildSkyAndLights();
        this.buildTerrainAndPaths();
        this.buildWelcomeArch();
        this.buildPondAndBridge();
        this.buildTreesAndFlowers();
        this.buildFencesAndBenches();
        this.buildButterflies();
        this.initGuideTrail();
    }

    buildSkyAndLights() {
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x9be2ff, 0.0055);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x559944, 0.78);
        hemiLight.position.set(0, 60, 0);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xfff6d6, 0.85);
        dirLight.position.set(45, 75, 35);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 180;
        const d = 80;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        this.scene.add(dirLight);

        // Mặt trời rực rỡ trên bầu trời
        const sunGeo = new THREE.SphereGeometry(6, 24, 24);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFEAA7 });
        const sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunMesh.position.set(60, 82, -75);
        this.scene.add(sunMesh);

        // Mây trắng bồng bềnh
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        for (let i = 0; i < 18; i++) {
            const cloudGroup = new THREE.Group();
            const puffCount = 3 + Math.floor(Math.random() * 3);
            for (let p = 0; p < puffCount; p++) {
                const puffGeo = new THREE.SphereGeometry(2.2 + Math.random() * 1.6, 12, 12);
                const puff = new THREE.Mesh(puffGeo, cloudMat);
                puff.position.set(p * 2.1 - 2, Math.random() * 0.8, (Math.random() - 0.5) * 1.5);
                cloudGroup.add(puff);
            }
            cloudGroup.position.set(
                (Math.random() - 0.5) * 160,
                28 + Math.random() * 18,
                (Math.random() - 0.5) * 160
            );
            this.scene.add(cloudGroup);
            this.clouds.push({
                mesh: cloudGroup,
                speed: 0.6 + Math.random() * 1.1
            });
        }
    }

    buildTerrainAndPaths() {
        // Mặt cỏ chính rộng lớn
        const groundGeo = new THREE.CylinderGeometry(95, 95, 1, 64);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x6AB04C });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Quảng trường tròn lát đá ở trung tâm
        const plazaGeo = new THREE.CylinderGeometry(9.5, 9.5, 0.12, 36);
        const plazaMat = new THREE.MeshLambertMaterial({ color: 0xF6E58D });
        const plaza = new THREE.Mesh(plazaGeo, plazaMat);
        plaza.position.y = 0.02;
        plaza.receiveShadow = true;
        this.scene.add(plaza);

        // Vòng tròn ngôi sao giữa quảng trường
        const innerRingGeo = new THREE.RingGeometry(6.8, 7.6, 36);
        const innerRingMat = new THREE.MeshBasicMaterial({ color: 0xFF7979, side: THREE.DoubleSide });
        const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
        innerRing.rotation.x = -Math.PI / 2;
        innerRing.position.y = 0.09;
        this.scene.add(innerRing);

        // Các viên đá lát đường dẫn từ trung tâm tới 8 khu vực động vật
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0xDFE4EA });
        window.GAME_DATA.animals.forEach(animal => {
            const target = animal.position;
            const dist = Math.hypot(target.x, target.z);
            const steps = Math.floor(dist / 3.2);
            for (let s = 3; s < steps; s++) {
                const t = s / steps;
                const sx = target.x * t + (Math.sin(s) * 0.4);
                const sz = target.z * t + (Math.cos(s) * 0.4);
                const stoneGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.08, 10);
                const stone = new THREE.Mesh(stoneGeo, stoneMat);
                stone.position.set(sx, 0.03, sz);
                stone.receiveShadow = true;
                this.scene.add(stone);
            }
        });
    }

    buildWelcomeArch() {
        const archGroup = new THREE.Group();
        const pillarGeo = new THREE.CylinderGeometry(0.45, 0.55, 6.2, 16);
        const pillarMat = new THREE.MeshLambertMaterial({ color: 0xEB4D4B });

        const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
        leftPillar.position.set(-4.5, 3.1, -10);
        leftPillar.castShadow = true;
        archGroup.add(leftPillar);

        const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
        rightPillar.position.set(4.5, 3.1, -10);
        rightPillar.castShadow = true;
        archGroup.add(rightPillar);

        // Bảng tên cổng chào bằng CanvasTexture
        const bannerCanvas = document.createElement("canvas");
        bannerCanvas.width = 1024;
        bannerCanvas.height = 256;
        const ctx = bannerCanvas.getContext("2d");
        ctx.fillStyle = "#FFD166";
        ctx.fillRect(0, 0, 1024, 256);
        ctx.strokeStyle = "#EB4D4B";
        ctx.lineWidth = 18;
        ctx.strokeRect(9, 9, 1006, 238);

        ctx.fillStyle = "#2C3A47";
        ctx.font = "900 66px 'Nunito', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CÔNG VIÊN CHỮ CÁI KỲ DIỆU", 512, 115);

        ctx.fillStyle = "#10AC84";
        ctx.font = "800 44px 'Nunito', sans-serif";
        ctx.fillText("🌟 Khám phá - Phát âm - Đánh vần Tiếng Việt 🌟", 512, 190);

        const bannerTex = new THREE.CanvasTexture(bannerCanvas);
        const signGeo = new THREE.BoxGeometry(10.2, 2.3, 0.4);
        const signMat = new THREE.MeshBasicMaterial({ map: bannerTex });
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(0, 5.8, -10);
        archGroup.add(signMesh);

        this.scene.add(archGroup);
    }

    buildPondAndBridge() {
        // Hồ nước trong xanh gần khu vực Rùa Vàng (x: -10, z: 42)
        const pondGeo = new THREE.CylinderGeometry(11, 11, 0.14, 36);
        const pondMat = new THREE.MeshLambertMaterial({ color: 0x34ACE0 });
        const pond = new THREE.Mesh(pondGeo, pondMat);
        pond.position.set(-10, 0.02, 44);
        this.scene.add(pond);

        // Viền đá quanh hồ
        const rockMat = new THREE.MeshLambertMaterial({ color: 0x95AFC0 });
        for (let i = 0; i < 28; i++) {
            const angle = (i / 28) * Math.PI * 2;
            const rockGeo = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.4, 0);
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(
                -10 + Math.cos(angle) * 11.1,
                0.3,
                44 + Math.sin(angle) * 11.1
            );
            this.scene.add(rock);
        }

        // Lá sen & hoa sen trên mặt hồ
        const padMat = new THREE.MeshLambertMaterial({ color: 0x20BF6B });
        const lotusMat = new THREE.MeshLambertMaterial({ color: 0xFF9FF3 });
        for (let i = 0; i < 9; i++) {
            const padGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.05, 16);
            const pad = new THREE.Mesh(padGeo, padMat);
            const rx = -10 + (Math.random() - 0.5) * 13;
            const rz = 44 + (Math.random() - 0.5) * 13;
            pad.position.set(rx, 0.11, rz);
            this.scene.add(pad);

            if (i % 2 === 0) {
                const flowerGeo = new THREE.ConeGeometry(0.35, 0.45, 8);
                const flower = new THREE.Mesh(flowerGeo, lotusMat);
                flower.position.set(rx, 0.3, rz);
                this.scene.add(flower);
            }
        }
    }

    buildTreesAndFlowers() {
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
        const foliageColors = [0x26DE81, 0x20BF6B, 0x7BED9F, 0x2ED573, 0xBADc58];

        // Tạo 95 cây xanh khắp công viên (tránh vùng trung tâm và vị trí các con vật)
        for (let i = 0; i < 95; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 14 + Math.random() * 68;
            const tx = Math.cos(angle) * radius;
            const tz = Math.sin(angle) * radius;

            // Tránh hồ nước
            if (Math.hypot(tx - (-10), tz - 44) < 13.5) continue;

            // Tránh đè lên vị trí đứng của 8 con vật
            const tooCloseToAnimal = window.GAME_DATA.animals.some(
                a => Math.hypot(tx - a.position.x, tz - a.position.z) < 5.5
            );
            if (tooCloseToAnimal) continue;

            const treeGroup = new THREE.Group();
            const scale = 0.85 + Math.random() * 0.65;

            const trunkGeo = new THREE.CylinderGeometry(0.35 * scale, 0.52 * scale, 2.8 * scale, 10);
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 1.4 * scale;
            trunk.castShadow = true;
            treeGroup.add(trunk);

            const leafColor = foliageColors[i % foliageColors.length];
            const leafMat = new THREE.MeshLambertMaterial({ color: leafColor });

            if (i % 3 === 0) {
                // Cây thông 3 tầng
                for (let layer = 0; layer < 3; layer++) {
                    const coneGeo = new THREE.ConeGeometry((2.3 - layer * 0.45) * scale, 2.4 * scale, 12);
                    const cone = new THREE.Mesh(coneGeo, leafMat);
                    cone.position.y = (2.8 + layer * 1.35) * scale;
                    cone.castShadow = true;
                    treeGroup.add(cone);
                }
            } else {
                // Cây tán tròn + quả táo đỏ
                const crownGeo = new THREE.DodecahedronGeometry(2.1 * scale, 1);
                const crown = new THREE.Mesh(crownGeo, leafMat);
                crown.position.y = 3.6 * scale;
                crown.castShadow = true;
                treeGroup.add(crown);

                if (i % 4 === 0) {
                    const appleMat = new THREE.MeshLambertMaterial({ color: 0xFF4757 });
                    for (let a = 0; a < 4; a++) {
                        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 8, 8), appleMat);
                        const aa = (a / 4) * Math.PI * 2;
                        apple.position.set(
                            Math.cos(aa) * 1.65 * scale,
                            3.3 * scale,
                            Math.sin(aa) * 1.65 * scale
                        );
                        treeGroup.add(apple);
                    }
                }
            }

            treeGroup.position.set(tx, 0, tz);
            treeGroup.userData = {
                type: "prop",
                name: "Cây Xanh Công Viên",
                emoji: "🌳",
                voiceText: "Cây xanh tỏa bóng mát trong lành! Chữ Cờ: C - ÂY - CÂY!"
            };
            this.scene.add(treeGroup);
            this.interactableProps.push(treeGroup);
            this.treeColliders.push({ x: tx, z: tz, r: 0.75 * scale });
        }

        // Thảm hoa rực rỡ khắp công viên
        const flowerColors = [0xFF6B81, 0xFFA502, 0xFFD32A, 0xFF9FF3, 0x70A1FF];
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x2ED573 });

        for (let f = 0; f < 160; f++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 68;
            const fx = Math.cos(angle) * radius;
            const fz = Math.sin(angle) * radius;
            if (Math.hypot(fx - (-10), fz - 44) < 12) continue;

            const flowerGroup = new THREE.Group();
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6), stemMat);
            stem.position.y = 0.22;
            flowerGroup.add(stem);

            const blossomMat = new THREE.MeshLambertMaterial({
                color: flowerColors[f % flowerColors.length]
            });
            const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), blossomMat);
            blossom.position.y = 0.48;
            flowerGroup.add(blossom);

            flowerGroup.position.set(fx, 0, fz);
            this.scene.add(flowerGroup);
        }
    }

    buildFencesAndBenches() {
        // Hàng rào gỗ bao quanh công viên ở bán kính 76m
        const woodMat = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        const fenceRadius = 76;
        const postCount = 72;

        for (let i = 0; i < postCount; i++) {
            const a1 = (i / postCount) * Math.PI * 2;
            const x1 = Math.cos(a1) * fenceRadius;
            const z1 = Math.sin(a1) * fenceRadius;

            const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 0.35), woodMat);
            post.position.set(x1, 0.8, z1);
            post.lookAt(0, 0.8, 0);
            this.scene.add(post);
        }

        // Ghế đá nghỉ chân quanh quảng trường
        const benchMat = new THREE.MeshLambertMaterial({ color: 0xECCC68 });
        const benchAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
        benchAngles.forEach(ang => {
            const bench = new THREE.Group();
            const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.8), benchMat);
            seat.position.y = 0.55;
            bench.add(seat);

            const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.15), benchMat);
            back.position.set(0, 0.9, -0.35);
            bench.add(back);

            bench.position.set(Math.cos(ang) * 8.2, 0, Math.sin(ang) * 8.2);
            bench.lookAt(0, 0, 0);
            this.scene.add(bench);
        });
    }

    buildButterflies() {
        const colors = [0xFF9FF3, 0xFECA57, 0x48DBFB, 0xFF6B6B];
        for (let i = 0; i < 16; i++) {
            const bGroup = new THREE.Group();
            const wingMat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                side: THREE.DoubleSide
            });
            const wingGeo = new THREE.CircleGeometry(0.22, 8);
            const leftWing = new THREE.Mesh(wingGeo, wingMat);
            leftWing.position.x = -0.14;
            const rightWing = new THREE.Mesh(wingGeo, wingMat);
            rightWing.position.x = 0.14;

            bGroup.add(leftWing);
            bGroup.add(rightWing);

            const center = {
                x: (Math.random() - 0.5) * 70,
                y: 1.5 + Math.random() * 2.2,
                z: (Math.random() - 0.5) * 70
            };
            bGroup.position.set(center.x, center.y, center.z);
            this.scene.add(bGroup);

            this.butterflies.push({
                group: bGroup,
                leftWing,
                rightWing,
                center,
                phase: Math.random() * Math.PI * 2,
                speed: 1.2 + Math.random()
            });
        }
    }

    /**
     * Khởi tạo chuỗi hạt sáng cầu vồng dẫn đường trên mặt đất đến con vật tiếp theo
     */
    initGuideTrail() {
        const dotCount = 16;
        for (let i = 0; i < dotCount; i++) {
            const geo = new THREE.OctahedronGeometry(0.28, 0);
            const hue = (i / dotCount) * 360;
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(`hsl(${hue}, 95%, 60%)`)
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.visible = false;
            this.scene.add(mesh);
            this.guideBeacons.push(mesh);
        }
    }

    /**
     * Cập nhật đường dẫn sáng từ vị trí người chơi / thú dẫn đường tới mục tiêu tiếp theo
     */
    updateGuideTrail(startPos, targetPos, elapsedTime) {
        if (!targetPos) {
            this.guideBeacons.forEach(b => (b.visible = false));
            return;
        }

        const count = this.guideBeacons.length;
        for (let i = 0; i < count; i++) {
            const beacon = this.guideBeacons[i];
            beacon.visible = true;
            // Tạo hiệu ứng dòng chảy ánh sáng tiến về phía con vật mục tiêu
            const flowT = ((i / count) + (elapsedTime * 0.25)) % 1.0;
            const x = THREE.MathUtils.lerp(startPos.x, targetPos.x, flowT);
            const z = THREE.MathUtils.lerp(startPos.z, targetPos.z, flowT);
            const bounceY = 0.45 + Math.sin(elapsedTime * 5 + i * 0.6) * 0.22;

            beacon.position.set(x, bounceY, z);
            beacon.rotation.y = elapsedTime * 2.5 + i;
        }
    }

    update(dt, elapsedTime) {
        // Mây trôi nhẹ nhàng
        this.clouds.forEach(c => {
            c.mesh.position.x += c.speed * dt;
            if (c.mesh.position.x > 95) c.mesh.position.x = -95;
        });

        // Bướm đập cánh bay lượn
        this.butterflies.forEach(b => {
            const t = elapsedTime * b.speed + b.phase;
            b.group.position.x = b.center.x + Math.cos(t) * 2.5;
            b.group.position.z = b.center.z + Math.sin(t * 0.8) * 2.5;
            b.group.position.y = b.center.y + Math.sin(t * 2.3) * 0.4;
            b.group.rotation.y = -t;

            const flap = Math.sin(elapsedTime * 18 + b.phase) * 0.7;
            b.leftWing.rotation.y = flap;
            b.rightWing.rotation.y = -flap;
        });
    }
}

window.ParkWorld = ParkWorld;

