/**
 * HỆ THỐNG ÂM THANH WEB AUDIO API & GIỌNG NỮ GOOGLE TIẾNG VIỆT (TTS)
 * Ưu tiên tuyệt đối Giọng Nữ Google ("Google Tiếng Việt" / Google Translate TTS)
 * Tự động tránh giọng nam mặc định của Windows (như Microsoft An / NamMinh)
 */

class SoundAndVoiceSystem {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.viVoice = null;
        this.hasNativeGoogleViVoice = false;
        this.currentHtmlAudio = null;
        this.speechQueueTimeouts = [];
        this.spellingTimeouts = [];
        this.initSpeechSynthesis();
    }

    initAudioContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    /**
     * Tìm và chọn đúng Giọng Nữ Google Tiếng Việt
     * Lưu ý trên Windows: voices[0] thường là "Microsoft An" (Giọng Nam),
     * còn "Google Tiếng Việt" (Giọng Nữ Google) nằm ở cuối danh sách!
     */
    initSpeechSynthesis() {
        if (!("speechSynthesis" in window)) return;

        const pickVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) return;

            const viVoices = voices.filter(
                v =>
                    v.lang.toLowerCase().includes("vi") ||
                    v.name.toLowerCase().includes("viet") ||
                    v.name.toLowerCase().includes("tiếng việt")
            );

            // 1. Ưu tiên số 1: Giọng Nữ Google chính gốc ("Google Tiếng Việt" / "Google Vietnamese")
            const googleFemaleVi = viVoices.find(v =>
                v.name.toLowerCase().includes("google")
            );

            if (googleFemaleVi) {
                this.viVoice = googleFemaleVi;
                this.hasNativeGoogleViVoice = true;
                return;
            }

            // 2. Ưu tiên số 2: Các giọng Nữ Tiếng Việt tự nhiên khác (HoaiMy, Linh, Female)
            // Loại bỏ rõ ràng các giọng Nam của Windows như "Microsoft An" hoặc "NamMinh"
            const femaleVi = viVoices.find(v => {
                const n = v.name.toLowerCase();
                return (
                    n.includes("hoaimy") ||
                    n.includes("linh") ||
                    n.includes("female") ||
                    n.includes("nữ")
                );
            });

            if (femaleVi) {
                this.viVoice = femaleVi;
                this.hasNativeGoogleViVoice = false;
                return;
            }

            // 3. Ưu tiên số 3: Bất kỳ giọng Tiếng Việt nào KHÔNG phải giọng nam "An" / "NamMinh"
            const nonMaleVi = viVoices.find(v => {
                const n = v.name.toLowerCase();
                return !n.includes("microsoft an") && !n.includes("namminh") && !n.includes("male");
            });

            this.viVoice = nonMaleVi || viVoices[0] || null;
            this.hasNativeGoogleViVoice = false;
        };

        pickVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = pickVoice;
        }
    }

    stopCurrentSpeech() {
        this.speechQueueTimeouts.forEach(t => clearTimeout(t));
        this.speechQueueTimeouts = [];

        if (this.currentHtmlAudio) {
            try {
                this.currentHtmlAudio.pause();
                this.currentHtmlAudio.src = "";
            } catch (e) {}
            this.currentHtmlAudio = null;
        }

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    }

    clearSpellingSequence() {
        this.spellingTimeouts.forEach(t => clearTimeout(t));
        this.spellingTimeouts = [];
        this.stopCurrentSpeech();
    }

    /**
     * Tách câu dài thành các mệnh đề ngắn (< 160 ký tự) để Giọng Nữ Google
     * đọc mượt mà, tự nhiên và không bao giờ bị ngắt giữa chừng
     */
    splitTextIntoChunks(text) {
        const clean = text.replace(/\s+/g, " ").trim();
        if (clean.length <= 150) return [clean];

        const rawParts = clean.split(/(?<=[.!?।;:])\s+/);
        const chunks = [];
        let current = "";

        rawParts.forEach(part => {
            if ((current + " " + part).trim().length <= 150) {
                current = (current + " " + part).trim();
            } else {
                if (current) chunks.push(current);
                current = part;
            }
        });
        if (current) chunks.push(current);
        return chunks.length > 0 ? chunks : [clean];
    }

    /**
     * Phát giọng đọc bằng Giọng Nữ Google:
     * - Nếu trình duyệt có sẵn voice "Google Tiếng Việt" (Chrome): dùng trực tiếp voice Google Nữ.
     * - Nếu trình duyệt chưa có voice Google (ví dụ Windows chỉ có giọng nam Microsoft An):
     *   tự động gọi luồng âm thanh Google Translate TTS (Chị Google `tl=vi`), và nếu ngoại tuyến thì dùng fallback giọng nữ cao độ chuẩn.
     */
    speak(text, updateBanner = true, rate = 0.96, pitch = 1.05) {
        if (updateBanner) {
            const bannerEl = document.getElementById("guide-message-text");
            if (bannerEl) {
                bannerEl.textContent = text;
            }
        }

        if (this.isMuted || !text) return;

        // Đảm bảo danh sách voice đã được cập nhật mới nhất
        if (!this.hasNativeGoogleViVoice && "speechSynthesis" in window) {
            this.initSpeechSynthesis();
        }

        this.stopCurrentSpeech();

        // Trường hợp 1: Trình duyệt có sẵn Giọng Nữ "Google Tiếng Việt"
        if (this.hasNativeGoogleViVoice && this.viVoice) {
            this.speakWithNativeGoogleVoice(text, rate, pitch);
            return;
        }

        // Trường hợp 2: Thử phát luồng âm thanh Giọng Nữ Google Translate TTS trực tuyến
        this.speakWithGoogleTranslateStream(text, rate, () => {
            // Dự phòng nếu bị chặn mạng / ngoại tuyến -> dùng Web Speech API với tinh chỉnh giọng nữ
            this.speakWithNativeGoogleVoice(text, rate, 1.22);
        });
    }

    speakWithNativeGoogleVoice(text, rate = 0.96, pitch = 1.05) {
        if (!("speechSynthesis" in window)) return;

        try {
            const chunks = this.splitTextIntoChunks(text);
            chunks.forEach(chunk => {
                const utter = new SpeechSynthesisUtterance(chunk);
                utter.lang = "vi-VN";
                if (this.viVoice) {
                    utter.voice = this.viVoice;
                }
                // Giọng Google Tiếng Việt chuẩn nhất khi pitch quanh 1.0 - 1.08
                utter.rate = rate;
                utter.pitch = this.hasNativeGoogleViVoice ? 1.04 : pitch;
                utter.volume = 1.0;
                window.speechSynthesis.speak(utter);
            });

            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
        } catch (err) {
            console.warn("SpeechSynthesis warning:", err);
        }
    }

    speakWithGoogleTranslateStream(text, rate = 0.96, onFallback) {
        const chunks = this.splitTextIntoChunks(text);
        let index = 0;

        const playNextChunk = () => {
            if (this.isMuted || index >= chunks.length) return;
            const chunk = chunks[index++];
            const encoded = encodeURIComponent(chunk);
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encoded}`;

            const audio = new Audio(url);
            audio.playbackRate = Math.max(0.8, Math.min(1.2, rate));
            this.currentHtmlAudio = audio;

            audio.onended = () => {
                if (index < chunks.length) {
                    playNextChunk();
                }
            };

            audio.onerror = () => {
                if (onFallback) onFallback();
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    if (onFallback) onFallback();
                });
            }
        };

        playNextChunk();
    }

    /**
     * Đọc đánh vần từng bước bằng Giọng Nữ Google và tô sáng từng thẻ âm tiết trên giao diện
     */
    speakSpellingSequence(voiceSteps, onTokenHighlight, onComplete) {
        this.clearSpellingSequence();

        let delay = 0;
        voiceSteps.forEach((stepText, idx) => {
            const t = setTimeout(() => {
                if (onTokenHighlight) onTokenHighlight(idx);
                this.playPopSound(450 + idx * 90);
                this.speak(stepText, false, 0.92, 1.06);
            }, delay);
            this.spellingTimeouts.push(t);
            delay += 1350;
        });

        const endTimer = setTimeout(() => {
            if (onComplete) onComplete();
        }, delay + 450);
        this.spellingTimeouts.push(endTimer);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopCurrentSpeech();
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.isMuted;
    }

    /**
     * Nhạc nền công viên nhẹ nhàng tươi vui + tiếng chim hót
     */
    startBGM() {
        this.initAudioContext();
        if (this.isMuted || this.bgmPlaying || !this.ctx) return;
        this.bgmPlaying = true;

        // Giai điệu pentatonic C-D-E-G-A vui tươi cho trẻ em
        const melody = [523.25, 587.33, 659.25, 783.99, 659.25, 880.00, 783.99, 523.25];
        let step = 0;

        this.bgmInterval = setInterval(() => {
            if (this.isMuted || !this.ctx || this.ctx.state !== "running") return;

            const freq = melody[step % melody.length];
            this.playSoftNote(freq, 0.35, 0.025);

            // Thỉnh thoảng thêm tiếng chim hót trong công viên
            if (step % 5 === 0) {
                this.playBirdChirp();
            }
            step++;
        }, 650);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    playSoftNote(freq, duration = 0.3, volume = 0.04) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
    }

    playBirdChirp() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(2500, now + 0.09);
        osc.frequency.exponentialRampToValueAtTime(2100, now + 0.18);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
    }

    playStepSound() {
        if (this.isMuted || !this.ctx) return;
        this.initAudioContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(110 + Math.random() * 25, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.07);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.085);
    }

    playPopSound(freq = 520) {
        if (this.isMuted) return;
        this.initAudioContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 0.09);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    }

    playSuccessFanfare() {
        if (this.isMuted) return;
        this.initAudioContext();
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
            setTimeout(() => this.playSoftNote(f, 0.28, 0.12), i * 110);
        });
    }

    playWrongSound() {
        if (this.isMuted) return;
        this.initAudioContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.25);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.29);
    }

    /**
     * Giả lập tiếng kêu vui nhộn của từng loài động vật kết hợp Giọng Nữ Google
     */
    playAnimalSound(animal) {
        this.initAudioContext();
        if (!this.isMuted && this.ctx) {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            switch (animal.soundType) {
                case "cow":
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(135, now);
                    osc.frequency.linearRampToValueAtTime(165, now + 0.35);
                    osc.frequency.linearRampToValueAtTime(115, now + 0.8);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.86);
                    break;

                case "dog":
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.19);
                    break;

                case "cat":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(520, now);
                    osc.frequency.linearRampToValueAtTime(780, now + 0.2);
                    osc.frequency.linearRampToValueAtTime(460, now + 0.5);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.53);
                    break;

                case "rooster":
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.setValueAtTime(660, now + 0.15);
                    osc.frequency.linearRampToValueAtTime(880, now + 0.35);
                    osc.frequency.linearRampToValueAtTime(520, now + 0.65);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.7);
                    break;

                case "elephant":
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(240, now);
                    osc.frequency.exponentialRampToValueAtTime(580, now + 0.35);
                    osc.frequency.linearRampToValueAtTime(420, now + 0.7);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.76);
                    break;

                default:
                    this.playPopSound(600);
                    break;
            }
        }

        this.speak(`${animal.soundText} Mình là bạn ${animal.name}, mang chữ ${animal.letterUpper}!`);
    }
}

window.soundSystem = new SoundAndVoiceSystem();
