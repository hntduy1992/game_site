/**
 * BỘ ĐIỀU KHIỂN CHÍNH TRÒ CHƠI GÓC NHÌN THỨ NHẤT (FIRST-PERSON CONTROLLER & UI)
 * Tích hợp: Di chuyển FPS, Raycast Click Trái, Menu Chuột Phải (Context Menu),
 * Bài Học & Kiểm Tra Đánh Vần, Thú Đi Theo Dẫn Đường & Bản Đồ Minimap
 */

class FirstPersonEducationalGame {
    constructor() {
        // Thông tin người chơi
        this.playerName = "Bé Ngoan";
        this.playerGrade = "lop-1"; // Mặc định Lớp 1 (6 tuổi)
        this.isPlaying = false;
        this.isModalOpen = false;
        this.isContextMenuOpen = false;

        // Trạng thái góc nhìn thứ nhất (FPS Camera)
        this.yaw = 0; // Góc quay ngang (radian)
        this.pitch = 0; // Góc nhìn lên/xuống
        this.eyeHeight = 1.7;
        this.jumpY = 0;
        this.jumpVel = 0;
        this.isGrounded = true;
        this.walkBobTimer = 0;
        this.stepSoundCooldown = 0;

        // Phím bấm di chuyển
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            turnLeft: false,
            turnRight: false,
            sprint: false
        };

        // Kéo chuột dự phòng nếu không khóa con trỏ
        this.isDraggingLook = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Raycaster tương tác
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 28; // Khoảng cách tương tác tối đa 28m
        this.hoveredAnimal = null;
        this.hoveredProp = null;
        this.contextTargetAnimal = null;

        // Trạng thái Bài học & Kiểm tra hiện tại
        this.currentLessonAnimal = null;
        this.currentQuizIndex = 0;

        this.initThreeJS();
        this.initStartScreenEvents();
        this.initInputEvents();
        this.initHUDAndModalEvents();
        this.renderFollowerSlots();

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThreeJS() {
        const container = document.getElementById("game-canvas-container");
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            220
        );
        this.camera.rotation.order = "YXZ";
        this.camera.position.set(0, this.eyeHeight, 6);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Khởi tạo Thế giới Công viên & 8 Bạn Động vật
        this.world = new window.ParkWorld(this.scene);
        this.animalManager = new window.AnimalManager(this.scene);

        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initStartScreenEvents() {
        const gradeOptions = document.querySelectorAll(".grade-option");
        gradeOptions.forEach(opt => {
            opt.addEventListener("click", () => {
                gradeOptions.forEach(o => o.classList.remove("active"));
                opt.classList.add("active");
                this.playerGrade = opt.dataset.grade;
                window.soundSystem.playPopSound(600);
            });
        });

        const startBtn = document.getElementById("btn-start-game");
        const nameInput = document.getElementById("player-name-input");

        startBtn.addEventListener("click", () => {
            const rawName = nameInput.value.trim();
            this.playerName = rawName.length > 0 ? rawName : "Bé Ngoan";
            this.startGame();
        });

        nameInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                startBtn.click();
            }
        });
    }

    startGame() {
        const gradeObj = window.GAME_DATA.grades[this.playerGrade] || window.GAME_DATA.grades["lop-1"];

        document.getElementById("hud-player-name").textContent = this.playerName;
        document.getElementById("hud-player-grade").textContent = gradeObj.name;

        document.getElementById("start-screen").classList.add("hidden");
        document.getElementById("hud-layer").classList.remove("hidden");

        this.isPlaying = true;
        window.soundSystem.initAudioContext();
        window.soundSystem.startBGM();

        // Đặt hướng nhìn ban đầu về phía cổng chào và bạn Bò Sữa ở phía Bắc
        this.yaw = 0;
        this.pitch = 0;
        this.updateCameraRotation();

        // Lời chào hướng dẫn bằng giọng nói Tiếng Việt
        const welcomeMsg = `Chào mừng ${this.playerName} học sinh ${gradeObj.name} đến với Công Viên Chữ Cái Kỳ Diệu! Bé hãy dùng phím W, A, S, D hoặc phím mũi tên để đi dạo. Nhấn chuột trái để chọn con vật, hoặc chuột phải để mở bảng thao tác nhé! Bạn Bò Sữa đang đợi bé ở phía trước kìa!`;
        window.soundSystem.speak(welcomeMsg, true);
    }

    initInputEvents() {
        const canvas = this.renderer.domElement;

        // Bàn phím di chuyển góc nhìn thứ nhất
        window.addEventListener("keydown", e => {
            if (!this.isPlaying || this.isModalOpen) return;

            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    this.keys.forward = true;
                    break;
                case "KeyS":
                case "ArrowDown":
                    this.keys.backward = true;
                    break;
                case "KeyA":
                    this.keys.left = true;
                    break;
                case "KeyD":
                    this.keys.right = true;
                    break;
                case "ArrowLeft":
                case "KeyQ":
                    this.keys.turnLeft = true;
                    break;
                case "ArrowRight":
                case "KeyE":
                    this.keys.turnRight = true;
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    this.keys.sprint = true;
                    break;
                case "Space":
                    if (this.isGrounded) {
                        this.jumpVel = 6.2;
                        this.isGrounded = false;
                        window.soundSystem.playPopSound(380);
                    }
                    break;
            }
        });

        window.addEventListener("keyup", e => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    this.keys.forward = false;
                    break;
                case "KeyS":
                case "ArrowDown":
                    this.keys.backward = false;
                    break;
                case "KeyA":
                    this.keys.left = false;
                    break;
                case "KeyD":
                    this.keys.right = false;
                    break;
                case "ArrowLeft":
                case "KeyQ":
                    this.keys.turnLeft = false;
                    break;
                case "ArrowRight":
                case "KeyE":
                    this.keys.turnRight = false;
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    this.keys.sprint = false;
                    break;
            }
        });

        // Xoay góc nhìn bằng chuột (Hỗ trợ cả Pointer Lock lẫn kéo chuột mượt mà)
        window.addEventListener("mousemove", e => {
            if (!this.isPlaying || this.isModalOpen || this.isContextMenuOpen) return;

            if (document.pointerLockElement === canvas) {
                const sensitivity = 0.0022;
                this.yaw -= e.movementX * sensitivity;
                this.pitch -= e.movementY * sensitivity;
                this.pitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, this.pitch));
                this.updateCameraRotation();
            } else if (this.isDraggingLook) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.yaw -= dx * 0.0045;
                this.pitch -= dy * 0.0045;
                this.pitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, this.pitch));
                this.updateCameraRotation();
            }
        });

        // Xử lý Click chuột Trái (button === 0) và Chuột Phải (button === 2)
        canvas.addEventListener("mousedown", e => {
            if (!this.isPlaying || this.isModalOpen) return;

            // Nếu đang mở Context Menu mà click trái ra ngoài thì đóng menu
            if (this.isContextMenuOpen && e.button === 0) {
                this.hideContextMenu();
                return;
            }

            if (e.button === 0) {
                // CHUỘT TRÁI: Chọn / Tương tác với con vật hoặc vật thể
                this.isDraggingLook = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;

                const hit = this.detectTargetFromMouseOrCrosshair(e);
                if (hit && hit.animal) {
                    this.handleLeftClickAnimal(hit.animal);
                } else if (hit && hit.prop) {
                    window.soundSystem.playPopSound(520);
                    window.soundSystem.speak(hit.prop.userData.voiceText, true);
                } else {
                    // Nếu chưa khóa chuột và click vào khoảng trống thì bật Pointer Lock để xoay 360 độ
                    if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
                        canvas.requestPointerLock();
                    }
                }
            } else if (e.button === 2) {
                // CHUỘT PHẢI: Mở Menu Thao Tác (Context Menu)
                e.preventDefault();
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
                const hit = this.detectTargetFromMouseOrCrosshair(e);
                const targetAnimal =
                    (hit && hit.animal) ||
                    this.hoveredAnimal ||
                    this.findNearestAnimalWithin(13);

                this.openContextMenu(e.clientX, e.clientY, targetAnimal);
            }
        });

        window.addEventListener("mouseup", () => {
            this.isDraggingLook = false;
        });

        // Chặn menu chuột phải mặc định của trình duyệt để hiện Context Menu của Game
        window.addEventListener("contextmenu", e => {
            if (this.isPlaying && !this.isModalOpen) {
                e.preventDefault();
            }
        });

        // Các nút điều khiển ảo trên màn hình (D-pad cho trẻ nhỏ)
        document.querySelectorAll(".key-btn").forEach(btn => {
            const action = btn.dataset.key;
            const startHold = e => {
                e.preventDefault();
                btn.classList.add("pressed");
                this.keys[action] = true;
            };
            const endHold = e => {
                e.preventDefault();
                btn.classList.remove("pressed");
                this.keys[action] = false;
            };
            btn.addEventListener("mousedown", startHold);
            btn.addEventListener("mouseup", endHold);
            btn.addEventListener("mouseleave", endHold);
            btn.addEventListener("touchstart", startHold);
            btn.addEventListener("touchend", endHold);
        });
    }

    updateCameraRotation() {
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    /**
     * Phát hiện con vật hoặc vật thể dưới tâm ngắm (khi khóa chuột) hoặc vị trí trỏ chuột
     */
    detectTargetFromMouseOrCrosshair(mouseEvent) {
        const coords = new THREE.Vector2(0, 0);
        if (document.pointerLockElement !== this.renderer.domElement && mouseEvent) {
            coords.x = (mouseEvent.clientX / window.innerWidth) * 2 - 1;
            coords.y = -(mouseEvent.clientY / window.innerHeight) * 2 + 1;
        }

        this.raycaster.setFromCamera(coords, this.camera);
        const allMeshes = [];
        this.animalManager.animals.forEach(a => allMeshes.push(a.root));
        this.world.interactableProps.forEach(p => allMeshes.push(p));

        const intersects = this.raycaster.intersectObjects(allMeshes, true);
        if (intersects.length > 0) {
            for (const hit of intersects) {
                if (hit.object.userData && hit.object.userData.type === "animal") {
                    return { animal: hit.object.userData.animalInstance };
                }
                if (hit.object.parent && hit.object.parent.userData && hit.object.parent.userData.type === "prop") {
                    return { prop: hit.object.parent };
                }
            }
        }
        return null;
    }

    findNearestAnimalWithin(maxDist) {
        let nearest = null;
        let minD = maxDist;
        const p = this.camera.position;
        this.animalManager.animals.forEach(a => {
            const d = Math.hypot(a.root.position.x - p.x, a.root.position.z - p.z);
            if (d < minD) {
                minD = d;
                nearest = a;
            }
        });
        return nearest;
    }

    /**
     * Khi người chơi Click Trái vào con vật:
     * Phát tiếng kêu vui nhộn và mở bài học chữ cái của con vật đó
     */
    handleLeftClickAnimal(animalInstance) {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        animalInstance.celebrationTimer = 1.2;
        window.soundSystem.playAnimalSound(animalInstance.data);
        this.openLessonModal(animalInstance, "lesson");
    }

    /**
     * Mở Menu Thao Tác Chuột Phải (Context Menu)
     */
    openContextMenu(clientX, clientY, animalInstance) {
        this.isContextMenuOpen = true;
        this.contextTargetAnimal = animalInstance;
        window.soundSystem.playPopSound(680);

        const menu = document.getElementById("context-menu");
        const emojiEl = document.getElementById("ctx-emoji");
        const titleEl = document.getElementById("ctx-title");
        const subEl = document.getElementById("ctx-subtitle");
        const listEl = document.getElementById("ctx-list");

        listEl.innerHTML = "";

        if (animalInstance) {
            const d = animalInstance.data;
            emojiEl.textContent = d.emoji;
            titleEl.textContent = `Bạn ${d.name} (Chữ ${d.letterUpper})`;
            subEl.textContent = animalInstance.completed
                ? "✅ Đã kết bạn & đang đi theo bé"
                : `📍 ${d.zoneName}`;

            const actions = [
                {
                    icon: "📚",
                    label: `Học chữ ${d.letterUpper} & Đánh vần`,
                    primary: true,
                    onClick: () => this.openLessonModal(animalInstance, "lesson")
                },
                {
                    icon: "✍️",
                    label: "Làm bài kiểm tra kết bạn",
                    primary: false,
                    onClick: () => this.openLessonModal(animalInstance, "quiz")
                },
                {
                    icon: "🔊",
                    label: `Nghe phát âm & Tiếng kêu (${d.letterUpper})`,
                    primary: false,
                    onClick: () => {
                        animalInstance.celebrationTimer = 1.5;
                        window.soundSystem.playAnimalSound(d);
                    }
                },
                {
                    icon: "🧭",
                    label: "Nhờ bạn dẫn đường tới con vật khác",
                    primary: false,
                    onClick: () => this.triggerAnimalGuideAction(animalInstance)
                },
                {
                    icon: "🍎",
                    label: `Cho ${d.name} ăn & Vuốt ve`,
                    primary: false,
                    onClick: () => {
                        animalInstance.celebrationTimer = 2.0;
                        this.animalManager.spawnCelebrationBurst(animalInstance.root.position);
                        window.soundSystem.playSuccessFanfare();
                        window.soundSystem.speak(
                            `Măm măm! Cảm ơn ${this.playerName} nhé! Bạn ${d.name} yêu bé lắm! ${d.fact}`,
                            true
                        );
                    }
                }
            ];

            actions.forEach(act => {
                const li = document.createElement("li");
                li.className = "context-item" + (act.primary ? " primary-action" : "");
                li.innerHTML = `<span class="ctx-icon">${act.icon}</span><span>${act.label}</span>`;
                li.addEventListener("click", () => {
                    this.hideContextMenu();
                    act.onClick();
                });
                listEl.appendChild(li);
            });
        } else {
            // Nếu click chuột phải khi đang đứng ở đường công viên (chưa ngắm trúng con vật)
            emojiEl.textContent = "🏞️";
            titleEl.textContent = "Thao Tác Công Viên";
            subEl.textContent = "Chọn nhanh hoạt động cho bé";

            const generalActions = [
                {
                    icon: "🧭",
                    label: "Chỉ đường tới bạn động vật gần nhất",
                    primary: true,
                    onClick: () => this.guideToNextAnimalFromPlayer()
                },
                {
                    icon: "📣",
                    label: "Gọi các bạn thú đi theo nhảy múa",
                    primary: false,
                    onClick: () => {
                        if (this.animalManager.followerOrder.length === 0) {
                            window.soundSystem.speak(
                                "Bé hãy đến gặp một con vật và hoàn thành bài kiểm tra để các bạn ấy đi theo bé nhé!",
                                true
                            );
                        } else {
                            this.animalManager.followerOrder.forEach(a => {
                                a.celebrationTimer = 2.2;
                                this.animalManager.spawnCelebrationBurst(a.root.position);
                            });
                            window.soundSystem.playSuccessFanfare();
                            window.soundSystem.speak(
                                `Hoan hô! Có ${this.animalManager.followerOrder.length} bạn động vật đang vui vẻ nhảy múa cùng ${this.playerName} kìa!`,
                                true
                            );
                        }
                    }
                },
                {
                    icon: "🔊",
                    label: "Nghe lại hướng dẫn cách chơi",
                    primary: false,
                    onClick: () => {
                        window.soundSystem.speak(
                            "Bé dùng phím W, A, S, D hoặc mũi tên để di chuyển. Nhấn chuột trái vào con vật để học chữ cái và đánh vần. Hoàn thành bài kiểm tra, con vật sẽ đi theo và dẫn đường cho bé!",
                            true
                        );
                    }
                }
            ];

            generalActions.forEach(act => {
                const li = document.createElement("li");
                li.className = "context-item" + (act.primary ? " primary-action" : "");
                li.innerHTML = `<span class="ctx-icon">${act.icon}</span><span>${act.label}</span>`;
                li.addEventListener("click", () => {
                    this.hideContextMenu();
                    act.onClick();
                });
                listEl.appendChild(li);
            });
        }

        menu.classList.remove("hidden");

        // Căn chỉnh vị trí để không tràn khỏi màn hình
        const menuW = 290;
        const menuH = 310;
        const posX = Math.min(window.innerWidth - menuW - 15, Math.max(15, clientX));
        const posY = Math.min(window.innerHeight - menuH - 15, Math.max(15, clientY));
        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;
    }

    hideContextMenu() {
        this.isContextMenuOpen = false;
        document.getElementById("context-menu").classList.add("hidden");
    }

    /**
     * Hành động dẫn đường: Con vật xoay người và dẫn bé tới con vật chưa học tiếp theo
     */
    triggerAnimalGuideAction(animalInstance) {
        if (!animalInstance.completed) {
            window.soundSystem.speak(
                `Bé ơi, hãy hoàn thành bài kiểm tra chữ ${animalInstance.data.letterUpper} của bạn ${animalInstance.data.name} trước, rồi bạn ấy sẽ đi theo và dẫn đường cho bé nhé!`,
                true
            );
            this.openLessonModal(animalInstance, "quiz");
            return;
        }

        this.animalManager.activeGuideAnimal = animalInstance;
        this.guideToNextAnimalFromPlayer(animalInstance);
    }

    guideToNextAnimalFromPlayer(guideAnimal = null) {
        const nextAnimal = this.animalManager.getNextUncompletedAnimal(this.camera.position);
        if (!nextAnimal) {
            window.soundSystem.speak(
                `Tuyệt vời! ${this.playerName} đã kết bạn với tất cả 8 loài động vật trong công viên rồi!`,
                true
            );
            return;
        }

        // Xoay nhẹ góc nhìn của người chơi hướng về phía con vật tiếp theo để bé dễ đi theo
        const dx = nextAnimal.root.position.x - this.camera.position.x;
        const dz = nextAnimal.root.position.z - this.camera.position.z;
        this.yaw = Math.atan2(-dx, -dz);
        this.pitch = 0;
        this.updateCameraRotation();

        const guideName = guideAnimal ? `Bạn ${guideAnimal.data.name}` : "Dải sao cầu vồng";
        window.soundSystem.playSuccessFanfare();
        window.soundSystem.speak(
            `${guideName} đang dẫn đường cho bé kìa! Hãy đi theo các ngôi sao phát sáng phía trước để đến gặp bạn ${nextAnimal.data.name} học chữ ${nextAnimal.data.letterUpper} ở ${nextAnimal.data.zoneName} nhé!`,
            true
        );
    }

    /**
     * Quản lý Giao diện HUD, Modal Bài học & Kiểm tra
     */
    initHUDAndModalEvents() {
        // Nút âm thanh trên HUD
        const btnMute = document.getElementById("btn-toggle-audio");
        btnMute.addEventListener("click", () => {
            const muted = window.soundSystem.toggleMute();
            btnMute.innerHTML = muted ? "🔇 Đã tắt tiếng" : "🔊 Âm thanh: Bật";
        });

        // Nút nhờ chỉ đường nhanh trên HUD
        document.getElementById("btn-find-next").addEventListener("click", () => {
            this.guideToNextAnimalFromPlayer(this.animalManager.activeGuideAnimal);
        });

        // Đóng modal bài học
        document.getElementById("btn-close-lesson").addEventListener("click", () => {
            this.closeLessonModal();
        });

        // Chuyển đổi giữa Tab Bài Học và Tab Kiểm Tra
        document.getElementById("tab-btn-lesson").addEventListener("click", () => {
            this.switchModalTab("lesson");
        });
        document.getElementById("tab-btn-quiz").addEventListener("click", () => {
            this.switchModalTab("quiz");
        });
        document.getElementById("btn-start-quiz").addEventListener("click", () => {
            this.switchModalTab("quiz");
        });

        // Các nút phát âm trong Bài học
        document.getElementById("btn-speak-letter").addEventListener("click", () => {
            if (!this.currentLessonAnimal) return;
            const d = this.currentLessonAnimal.data;
            window.soundSystem.playPopSound(560);
            window.soundSystem.speak(
                `${d.voiceLetter} Chữ ${d.letterUpper} trong từ ${d.word}!`,
                false
            );
        });

        document.getElementById("big-letter-card").addEventListener("click", () => {
            document.getElementById("btn-speak-letter").click();
        });

        document.getElementById("btn-speak-spelling").addEventListener("click", () => {
            if (!this.currentLessonAnimal) return;
            this.playAnimatedSpelling(this.currentLessonAnimal.data);
        });

        document.getElementById("btn-speak-animal").addEventListener("click", () => {
            if (!this.currentLessonAnimal) return;
            window.soundSystem.playAnimalSound(this.currentLessonAnimal.data);
        });

        // Nút nghe lại câu hỏi kiểm tra
        document.getElementById("btn-listen-quiz-question").addEventListener("click", () => {
            if (!this.currentLessonAnimal) return;
            const q = this.currentLessonAnimal.data.quizzes[this.currentQuizIndex];
            if (q) window.soundSystem.speak(q.voice, false);
        });

        // Nút đóng màn hình chiến thắng để tiếp tục dạo chơi cùng đoàn thú
        document.getElementById("btn-continue-park").addEventListener("click", () => {
            document.getElementById("victory-modal").classList.add("hidden");
            this.isModalOpen = false;
            window.soundSystem.speak(
                `Chúc mừng ${this.playerName}! Cả 8 bạn động vật đang nối đuôi nhau đi theo bé khắp công viên kìa!`,
                true
            );
        });
    }

    renderFollowerSlots() {
        const container = document.getElementById("follower-icons-row");
        container.innerHTML = "";
        this.animalManager.animals.forEach(a => {
            const slot = document.createElement("div");
            slot.className = "follower-slot" + (a.completed ? " unlocked" : "");
            slot.title = `${a.data.name} - Chữ ${a.data.letterUpper}`;
            slot.textContent = a.data.emoji;
            slot.addEventListener("click", () => {
                this.openLessonModal(a, "lesson");
            });
            container.appendChild(slot);
        });

        const doneCount = this.animalManager.followerOrder.length;
        const total = this.animalManager.animals.length;
        document.getElementById("progress-count-text").textContent = `${doneCount} / ${total} Bạn thú`;
        document.getElementById("progress-bar-fill").style.width = `${(doneCount / total) * 100}%`;
    }

    /**
     * Hiển thị Modal Bài học & Đánh vần của Con vật
     */
    openLessonModal(animalInstance, initialTab = "lesson") {
        this.hideContextMenu();
        this.isModalOpen = true;
        this.currentLessonAnimal = animalInstance;
        this.currentQuizIndex = 0;

        const d = animalInstance.data;
        document.getElementById("lesson-animal-emoji").textContent = d.emoji;
        document.getElementById("lesson-animal-title").textContent = `Bạn ${d.name} - Học Chữ ${d.letterUpper}`;
        document.getElementById("lesson-animal-zone").textContent = `📍 ${d.zoneName} • ${d.fact}`;

        document.getElementById("lesson-letter-pair").textContent = `${d.letterUpper} ${d.letterLower}`;
        document.getElementById("lesson-phonetic").textContent = d.phonetic;
        document.getElementById("lesson-word-label").textContent = `ĐÁNH VẦN TỪ: ${d.word} (${d.emoji})`;
        document.getElementById("lesson-example-sentence").textContent = `📖 Câu ví dụ: "${d.sentence}"`;

        // Render các thẻ âm tiết đánh vần
        const blocksWrap = document.getElementById("spelling-blocks-container");
        blocksWrap.innerHTML = "";
        d.spellingTokens.forEach((token, idx) => {
            const span = document.createElement("span");
            span.className =
                "spell-token" + (idx === d.spellingTokens.length - 1 ? " spell-result" : "");
            span.id = `spell-token-${idx}`;
            span.textContent = token;
            blocksWrap.appendChild(span);

            if (idx < d.spellingTokens.length - 1) {
                const sign = document.createElement("span");
                sign.className = "spell-plus";
                sign.textContent = idx === d.spellingTokens.length - 2 ? "➔" : "+";
                blocksWrap.appendChild(sign);
            }
        });

        document.getElementById("lesson-modal").classList.remove("hidden");
        this.switchModalTab(initialTab);
    }

    switchModalTab(tabName) {
        window.soundSystem.clearSpellingSequence();
        const tabLessonBtn = document.getElementById("tab-btn-lesson");
        const tabQuizBtn = document.getElementById("tab-btn-quiz");
        const viewLesson = document.getElementById("lesson-tab-content");
        const viewQuiz = document.getElementById("quiz-tab-content");

        if (tabName === "lesson") {
            tabLessonBtn.classList.add("active");
            tabQuizBtn.classList.remove("active");
            viewLesson.style.display = "block";
            viewQuiz.style.display = "none";

            const d = this.currentLessonAnimal.data;
            window.soundSystem.speak(
                `Bài học cùng bạn ${d.name}. ${d.voiceLetter} Chúng mình cùng đánh vần từ ${d.word} nhé!`,
                false
            );
        } else {
            tabLessonBtn.classList.remove("active");
            tabQuizBtn.classList.add("active");
            viewLesson.style.display = "none";
            viewQuiz.style.display = "block";

            this.currentQuizIndex = 0;
            this.renderCurrentQuizQuestion();
        }
    }

    playAnimatedSpelling(animalData) {
        const tokens = document.querySelectorAll(".spell-token");
        tokens.forEach(t => t.classList.remove("active-reading"));

        window.soundSystem.speakSpellingSequence(
            animalData.voiceSpelling,
            activeIndex => {
                tokens.forEach(t => t.classList.remove("active-reading"));
                const activeEl = document.getElementById(`spell-token-${activeIndex}`);
                if (activeEl) activeEl.classList.add("active-reading");
            },
            () => {
                tokens.forEach(t => t.classList.remove("active-reading"));
            }
        );
    }

    renderCurrentQuizQuestion() {
        const animal = this.currentLessonAnimal;
        const quizzes = animal.data.quizzes;
        const quiz = quizzes[this.currentQuizIndex];

        // Hiển thị tiến trình câu hỏi (Câu 1 / 2)
        const dotsWrap = document.getElementById("quiz-progress-dots");
        dotsWrap.innerHTML = "";
        quizzes.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.className =
                "quiz-dot" +
                (idx < this.currentQuizIndex
                    ? " done"
                    : idx === this.currentQuizIndex
                    ? " active"
                    : "");
            dotsWrap.appendChild(dot);
        });

        document.getElementById("quiz-question-text").textContent = `Câu ${
            this.currentQuizIndex + 1
        }/${quizzes.length}: ${quiz.question}`;

        const feedbackEl = document.getElementById("quiz-feedback-msg");
        feedbackEl.textContent = "Bé hãy chọn đáp án đúng nhất bên dưới nhé!";
        feedbackEl.style.color = "#576574";

        // Trộn ngẫu nhiên vị trí các đáp án để bài kiểm tra sinh động
        const indexedOptions = quiz.options.map((text, idx) => ({
            text,
            isCorrect: idx === quiz.correctIndex
        }));
        for (let i = indexedOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
        }

        const optionsGrid = document.getElementById("quiz-options-grid");
        optionsGrid.innerHTML = "";

        indexedOptions.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "quiz-option-btn";
            btn.textContent = opt.text;
            btn.addEventListener("click", () => {
                this.handleQuizAnswer(btn, opt.isCorrect);
            });
            optionsGrid.appendChild(btn);
        });

        window.soundSystem.speak(quiz.voice, false);
    }

    handleQuizAnswer(buttonEl, isCorrect) {
        const feedbackEl = document.getElementById("quiz-feedback-msg");
        const animal = this.currentLessonAnimal;

        if (isCorrect) {
            buttonEl.classList.add("correct");
            window.soundSystem.playSuccessFanfare();
            feedbackEl.textContent = `🎉 Hoan hô! ${this.playerName} trả lời chính xác rồi!`;
            feedbackEl.style.color = "#10AC84";

            // Khoá tạm các nút để chuyển câu tiếp theo
            document.querySelectorAll(".quiz-option-btn").forEach(b => (b.disabled = true));

            if (this.currentQuizIndex + 1 < animal.data.quizzes.length) {
                window.soundSystem.speak("Đúng rồi! Bé giỏi quá, mình sang câu tiếp theo nhé!", false);
                setTimeout(() => {
                    this.currentQuizIndex++;
                    this.renderCurrentQuizQuestion();
                }, 1400);
            } else {
                // Đã hoàn thành toàn bộ bài kiểm tra của con vật này!
                setTimeout(() => {
                    this.onCompleteAnimalQuiz(animal);
                }, 1300);
            }
        } else {
            buttonEl.classList.add("wrong");
            window.soundSystem.playWrongSound();
            feedbackEl.textContent = "💡 Chưa đúng rồi, bé nghe kỹ và chọn lại nhé!";
            feedbackEl.style.color = "#EE5253";
            window.soundSystem.speak(
                `Chưa chính xác rồi, ${this.playerName} thử chọn đáp án khác nhé!`,
                false
            );
        }
    }

    /**
     * Khi hoàn thành bài kiểm tra:
     * Con vật đi theo người chơi và dẫn đường tới con vật tiếp theo!
     */
    onCompleteAnimalQuiz(animalInstance) {
        this.closeLessonModal();
        this.animalManager.markAnimalCompleted(animalInstance);
        this.renderFollowerSlots();
        window.soundSystem.playSuccessFanfare();

        const nextAnimal = this.animalManager.getNextUncompletedAnimal(this.camera.position);

        if (nextAnimal) {
            // Xoay hướng nhìn của bé về phía bạn thú dẫn đường và mục tiêu tiếp theo
            const dx = nextAnimal.root.position.x - this.camera.position.x;
            const dz = nextAnimal.root.position.z - this.camera.position.z;
            this.yaw = Math.atan2(-dx, -dz);
            this.pitch = 0;
            this.updateCameraRotation();

            const guideSpeech = `Xuất sắc quá ${this.playerName} ơi! Bạn ${animalInstance.data.name} đã trở thành bạn đồng hành và đang chạy phía trước dẫn đường cho bé kìa! Hãy đi theo bạn ${animalInstance.data.name} và vệt sao cầu vồng để đến gặp bạn ${nextAnimal.data.name} học chữ ${nextAnimal.data.letterUpper} nhé!`;
            window.soundSystem.speak(guideSpeech, true);
        } else {
            // Đã hoàn thành cả 8 con vật trong công viên!
            this.showVictoryCelebration();
        }
    }

    showVictoryCelebration() {
        this.isModalOpen = true;
        const badgeWrap = document.getElementById("victory-badges-list");
        badgeWrap.innerHTML = "";

        this.animalManager.animals.forEach(a => {
            const item = document.createElement("div");
            item.className = "victory-badge-item";
            item.textContent = `${a.data.emoji} Chữ ${a.data.letterUpper} (${a.data.name})`;
            badgeWrap.appendChild(item);
        });

        document.getElementById("victory-player-name").textContent = this.playerName;
        document.getElementById("victory-modal").classList.remove("hidden");

        window.soundSystem.playSuccessFanfare();
        window.soundSystem.speak(
            `Chúc mừng nhà thám hiểm nhí ${this.playerName}! Bé đã học giỏi tất cả các chữ cái, phát âm và đánh vần cùng 8 bạn động vật trong công viên! Tất cả các bạn thú đều đi theo bé rồi!`,
            true
        );
    }

    closeLessonModal() {
        window.soundSystem.clearSpellingSequence();
        document.getElementById("lesson-modal").classList.add("hidden");
        this.isModalOpen = false;
    }

    /**
     * Cập nhật di chuyển góc nhìn thứ nhất (FPS Movement & Collision)
     */
    updatePlayerMovement(dt) {
        if (!this.isPlaying || this.isModalOpen) return;

        // Phím xoay trái/phải
        const turnSpeed = 1.95;
        if (this.keys.turnLeft) {
            this.yaw += turnSpeed * dt;
            this.updateCameraRotation();
        }
        if (this.keys.turnRight) {
            this.yaw -= turnSpeed * dt;
            this.updateCameraRotation();
        }

        const forwardX = -Math.sin(this.yaw);
        const forwardZ = -Math.cos(this.yaw);
        const rightX = Math.cos(this.yaw);
        const rightZ = -Math.sin(this.yaw);

        let moveX = 0;
        let moveZ = 0;

        if (this.keys.forward) {
            moveX += forwardX;
            moveZ += forwardZ;
        }
        if (this.keys.backward) {
            moveX -= forwardX;
            moveZ -= forwardZ;
        }
        if (this.keys.right) {
            moveX += rightX;
            moveZ += rightZ;
        }
        if (this.keys.left) {
            moveX -= rightX;
            moveZ -= rightZ;
        }

        const moveLen = Math.hypot(moveX, moveZ);
        const baseSpeed = this.keys.sprint ? 11.0 : 7.2;

        if (moveLen > 0.01) {
            moveX = (moveX / moveLen) * baseSpeed * dt;
            moveZ = (moveZ / moveLen) * baseSpeed * dt;

            let nextX = this.camera.position.x + moveX;
            let nextZ = this.camera.position.z + moveZ;

            // Giới hạn trong hàng rào công viên (bán kính 73m)
            const distFromCenter = Math.hypot(nextX, nextZ);
            if (distFromCenter > 73) {
                nextX = (nextX / distFromCenter) * 73;
                nextZ = (nextZ / distFromCenter) * 73;
            }

            // Tránh đi lọt xuống giữa hồ nước sâu
            const distToPond = Math.hypot(nextX - (-10), nextZ - 44);
            if (distToPond < 10.2) {
                const pushAngle = Math.atan2(nextZ - 44, nextX - (-10));
                nextX = -10 + Math.cos(pushAngle) * 10.2;
                nextZ = 44 + Math.sin(pushAngle) * 10.2;
            }

            this.camera.position.x = nextX;
            this.camera.position.z = nextZ;

            // Hiệu ứng nhấp nhô bước chân góc nhìn thứ nhất (Head-bobbing)
            this.walkBobTimer += dt * (this.keys.sprint ? 13 : 9.5);
            this.stepSoundCooldown -= dt;
            if (this.stepSoundCooldown <= 0 && this.isGrounded) {
                window.soundSystem.playStepSound();
                this.stepSoundCooldown = this.keys.sprint ? 0.28 : 0.4;
            }
        } else {
            this.walkBobTimer = 0;
        }

        // Xử lý nhảy (Space)
        if (!this.isGrounded) {
            this.jumpY += this.jumpVel * dt;
            this.jumpVel -= 16.5 * dt;
            if (this.jumpY <= 0) {
                this.jumpY = 0;
                this.jumpVel = 0;
                this.isGrounded = true;
            }
        }

        const bobOffset = this.isGrounded ? Math.sin(this.walkBobTimer) * 0.075 : 0;
        this.camera.position.y = this.eyeHeight + this.jumpY + bobOffset;
    }

    /**
     * Cập nhật tâm ngắm Crosshair khi nhìn vào con vật
     */
    updateCrosshairTarget() {
        if (!this.isPlaying || this.isModalOpen) return;

        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const meshes = this.animalManager.animals.map(a => a.root);
        const hits = this.raycaster.intersectObjects(meshes, true);

        const reticle = document.getElementById("crosshair-reticle");
        const promptBubble = document.getElementById("target-prompt-bubble");
        const promptTitle = document.getElementById("target-prompt-title");

        if (hits.length > 0 && hits[0].object.userData && hits[0].object.userData.animalInstance) {
            const animal = hits[0].object.userData.animalInstance;
            this.hoveredAnimal = animal;
            reticle.classList.add("target-locked");
            promptTitle.textContent = `${animal.data.emoji} Bạn ${animal.data.name} - Chữ ${animal.data.letterUpper}`;
            promptBubble.classList.add("visible");
        } else {
            this.hoveredAnimal = null;
            reticle.classList.remove("target-locked");
            promptBubble.classList.remove("visible");
        }
    }

    /**
     * Vẽ Bản đồ nhỏ (Minimap Radar) góc trên bên phải
     */
    drawMinimap() {
        const canvas = document.getElementById("minimap-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = (w / 2) / 80; // Bán kính công viên 80m

        ctx.clearRect(0, 0, w, h);

        // Nền cỏ xanh
        ctx.fillStyle = "#7BED9F";
        ctx.beginPath();
        ctx.arc(cx, cy, w / 2, 0, Math.PI * 2);
        ctx.fill();

        // Quảng trường trung tâm
        ctx.fillStyle = "#F6E58D";
        ctx.beginPath();
        ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Hồ nước
        ctx.fillStyle = "#34ACE0";
        ctx.beginPath();
        ctx.arc(cx + (-10) * scale, cy + 44 * scale, 11 * scale, 0, Math.PI * 2);
        ctx.fill();

        const nextTarget = this.animalManager.getNextUncompletedAnimal(this.camera.position);

        // Vẽ đường chấm chấm dẫn tới con vật mục tiêu tiếp theo
        if (nextTarget) {
            ctx.strokeStyle = "#FF6B6B";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(cx + this.camera.position.x * scale, cy + this.camera.position.z * scale);
            ctx.lineTo(
                cx + nextTarget.root.position.x * scale,
                cy + nextTarget.root.position.z * scale
            );
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Vẽ vị trí 8 bạn động vật
        this.animalManager.animals.forEach(a => {
            const ax = cx + a.root.position.x * scale;
            const az = cy + a.root.position.z * scale;

            ctx.beginPath();
            ctx.arc(ax, az, a === nextTarget ? 7 : 5.5, 0, Math.PI * 2);
            if (a.completed) {
                ctx.fillStyle = "#10AC84"; // Xanh lá = Đã đi theo
            } else if (a === nextTarget) {
                ctx.fillStyle = "#FF4757"; // Đỏ cam nổi bật = Mục tiêu tiếp theo
            } else {
                ctx.fillStyle = "#FFA502"; // Vàng = Chưa học
            }
            ctx.fill();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Chữ cái đại diện trên minimap
            ctx.fillStyle = "#2C3A47";
            ctx.font = "900 10px 'Nunito', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(a.data.letterUpper, ax, az - 8);
        });

        // Vẽ vị trí & hướng nhìn của người chơi
        const px = cx + this.camera.position.x * scale;
        const pz = cy + this.camera.position.z * scale;

        ctx.save();
        ctx.translate(px, pz);
        ctx.rotate(-this.yaw);

        // Hình nón tầm nhìn
        ctx.fillStyle = "rgba(69, 170, 242, 0.35)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 22, -Math.PI * 0.72, -Math.PI * 0.28);
        ctx.closePath();
        ctx.fill();

        // Chấm tròn người chơi
        ctx.fillStyle = "#2C3A47";
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    animate() {
        requestAnimationFrame(this.animate);

        const dt = Math.min(this.clock.getDelta(), 0.1);
        const elapsedTime = this.clock.getElapsedTime();

        this.updatePlayerMovement(dt);
        this.updateCrosshairTarget();

        const playerForward = {
            x: -Math.sin(this.yaw),
            z: -Math.cos(this.yaw)
        };

        this.animalManager.update(dt, elapsedTime, this.camera.position, playerForward);

        // Cập nhật dải hạt sáng dẫn đường tới con vật tiếp theo
        const nextAnimal = this.animalManager.getNextUncompletedAnimal(this.camera.position);
        const trailStartPos = this.animalManager.activeGuideAnimal
            ? this.animalManager.activeGuideAnimal.root.position
            : this.camera.position;

        this.world.updateGuideTrail(
            trailStartPos,
            nextAnimal ? nextAnimal.root.position : null,
            elapsedTime
        );

        this.world.update(dt, elapsedTime);
        this.drawMinimap();

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.gameApp = new FirstPersonEducationalGame();
});

