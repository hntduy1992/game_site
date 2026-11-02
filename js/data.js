/**
 * CƠ SỞ DỮ LIỆU ĐỘNG VẬT, BÀI HỌC BẢNG CHỮ CÁI, PHÁT ÂM & ĐÁNH VẦN TIẾNG VIỆT
 * Thiết kế chuyên biệt cho trẻ 6 tuổi (Mặc định Lớp 1)
 */

window.GAME_DATA = {
    grades: {
        "mam-non": {
            id: "mam-non",
            name: "Mầm Non (5 tuổi)",
            desc: "Nhận biết chữ cái & tiếng kêu"
        },
        "lop-1": {
            id: "lop-1",
            name: "Lớp 1 (6 tuổi)",
            desc: "Bảng chữ cái, Phát âm & Đánh vần"
        },
        "lop-2": {
            id: "lop-2",
            name: "Lớp 2 (7 tuổi)",
            desc: "Đánh vần nâng cao & Mở rộng từ"
        }
    },

    animals: [
        {
            id: "bo_sua",
            name: "Bò Sữa",
            emoji: "🐮",
            zoneName: "Đồng Cỏ Xanh Phía Bắc",
            position: { x: 0, z: -26 },
            color: 0xFFFFFF,
            spotColor: 0x2F3542,
            soundType: "cow",
            soundText: "Ùm... bò... ò... ò!",
            letterUpper: "B",
            letterLower: "b",
            phonetic: "Phát âm: Bờ",
            voiceLetter: "Chữ Bờ. Phát âm là Bờ.",
            word: "BÒ SỮA",
            mainSyllable: "BÒ",
            spellingTokens: ["B", "O", "BO", "Huyền", "BÒ"],
            voiceSpelling: ["Bờ", "O", "Bờ O Bo", "Huyền", "Bò! Con Bò Sữa!"],
            sentence: "Con bò sữa đang gặm cỏ non trên cánh đồng.",
            fact: "Bò sữa cho chúng mình những ly sữa tươi thơm ngon giàu canxi mỗi sáng đấy!",
            quizzes: [
                {
                    question: "Tên của bạn 'BÒ SỮA' bắt đầu bằng chữ cái nào?",
                    voice: "Đố bé, tên của bạn Bò Sữa bắt đầu bằng chữ cái nào?",
                    options: ["Chữ B (Bờ)", "Chữ C (Cờ)", "Chữ M (Mờ)", "Chữ T (Tờ)"],
                    correctIndex: 0
                },
                {
                    question: "Bé hãy đánh vần tiếng 'BÒ' thật chuẩn nhé!",
                    voice: "Bé hãy chọn cách đánh vần tiếng Bò thật chuẩn nhé!",
                    options: [
                        "Bờ - O - Bo - Huyền - BÒ",
                        "Bờ - A - Ba - Sắc - BÁ",
                        "Cờ - O - Co - Huyền - CÒ",
                        "Mờ - O - Mo - Nặng - MỌ"
                    ],
                    correctIndex: 0
                }
            ]
        },
        {
            id: "cun_con",
            name: "Cún Đốm",
            emoji: "🐶",
            zoneName: "Vườn Hoa Hướng Dương",
            position: { x: 28, z: -22 },
            color: 0xF5CD79,
            spotColor: 0x784B28,
            soundType: "dog",
            soundText: "Gâu! Gâu! Gâu!",
            letterUpper: "C",
            letterLower: "c",
            phonetic: "Phát âm: Cờ",
            voiceLetter: "Chữ Cờ. Phát âm là Cờ.",
            word: "CÚN CON",
            mainSyllable: "CÚN",
            spellingTokens: ["C", "U - N (UN)", "CUN", "Sắc", "CÚN"],
            voiceSpelling: ["Cờ", "U Nờ Un", "Cờ Un Cun", "Sắc", "Cún! Bạn Cún Con!"],
            sentence: "Chú cún con vẫy đuôi mừng rỡ khi thấy bé đi học về.",
            fact: "Cún con có chiếc mũi cực kỳ thính và là người bạn trung thành nhất của con người!",
            quizzes: [
                {
                    question: "Chữ cái đầu tiên trong từ 'CÚN CON' phát âm là gì?",
                    voice: "Chữ cái đầu tiên trong từ Cún Con được phát âm là gì nhỉ?",
                    options: ["Phát âm là Cờ (C)", "Phát âm là Gờ (G)", "Phát âm là Hờ (H)", "Phát âm là Rờ (R)"],
                    correctIndex: 0
                },
                {
                    question: "Điền chữ cái còn thiếu vào chỗ trống: '... ÚN CON'",
                    voice: "Bé hãy điền chữ cái còn thiếu để tạo thành từ Cún Con nhé!",
                    options: ["Chữ C", "Chữ B", "Chữ V", "Chữ T"],
                    correctIndex: 0
                }
            ]
        },
        {
            id: "ga_trong",
            name: "Gà Trống",
            emoji: "🐔",
            zoneName: "Đồi Thông Gió Mát",
            position: { x: 38, z: 6 },
            color: 0xEB4D4B,
            spotColor: 0xF9CA24,
            soundType: "rooster",
            soundText: "Ò... ó... o... o!",
            letterUpper: "G",
            letterLower: "g",
            phonetic: "Phát âm: Gờ",
            voiceLetter: "Chữ Gờ. Phát âm là Gờ.",
            word: "GÀ TRỐNG",
            mainSyllable: "GÀ",
            spellingTokens: ["G", "A", "GA", "Huyền", "GÀ"],
            voiceSpelling: ["Gờ", "A", "Gờ A Ga", "Huyền", "Gà! Chú Gà Trống!"],
            sentence: "Chú gà trống gáy vang ò ó o gọi mặt trời thức dậy.",
            fact: "Gà trống có chiếc mào đỏ chót trên đầu và luôn dậy thật sớm mỗi buổi bình minh!",
            quizzes: [
                {
                    question: "Ghép âm 'G' với âm 'A' và dấu 'Huyền' ta được tiếng gì?",
                    voice: "Đố bé, khi ghép âm Gờ với âm A và dấu Huyền, ta được tiếng gì?",
                    options: ["Tiếng GÀ", "Tiếng CÁ", "Tiếng BÀ", "Tiếng NHÀ"],
                    correctIndex: 0
                },
                {
                    question: "Chữ cái nào dưới đây là chữ 'G' (Gờ)?",
                    voice: "Chữ cái nào dưới đây là chữ Gờ?",
                    options: ["G g", "C c", "B b", "M m"],
                    correctIndex: 0
                }
            ]
        },
        {
            id: "meo_hoa",
            name: "Mèo Hoa",
            emoji: "🐱",
            zoneName: "Ghế Đá Hoa Hồng",
            position: { x: 24, z: 34 },
            color: 0xFFA502,
            spotColor: 0xFFFFFF,
            soundType: "cat",
            soundText: "Meo... meo... meo!",
            letterUpper: "M",
            letterLower: "m",
            phonetic: "Phát âm: Mờ",
            voiceLetter: "Chữ Mờ. Phát âm là Mờ.",
            word: "MÈO HOA",
            mainSyllable: "MÈO",
            spellingTokens: ["M", "E - O (EO)", "MEO", "Huyền", "MÈO"],
            voiceSpelling: ["Mờ", "E O Eo", "Mờ Eo Meo", "Huyền", "Mèo! Bạn Mèo Hoa!"],
            sentence: "Bạn mèo hoa thích nằm sưởi nắng ấm áp bên hiên nhà.",
            fact: "Bàn chân mèo có lớp đệm thịt êm ái giúp mèo bước đi không phát ra tiếng động!",
            quizzes: [
                {
                    question: "Trong các từ sau, từ nào có chứa chữ 'M' (Mờ)?",
                    voice: "Trong các từ sau đây, từ nào có chứa chữ Mờ?",
                    options: ["MÈO HOA", "CON VOI", "THỎ TRẮNG", "RÙA VÀNG"],
                    correctIndex: 0
                },
                {
                    question: "Đánh vần tiếng 'MÈO' như thế nào là đúng?",
                    voice: "Bé hãy chọn cách đánh vần tiếng Mèo đúng nhất nhé!",
                    options: [
                        "Mờ - Eo - Meo - Huyền - MÈO",
                        "Bờ - Eo - Beo - Huyền - BÈO",
                        "Mờ - A - Ma - Sắc - MÁ",
                        "Tờ - Eo - Teo - Huyền - TÈO"
                    ],
                    correctIndex: 0
                }
            ]
        },
        {
            id: "rua_vang",
            name: "Rùa Vàng",
            emoji: "🐢",
            zoneName: "Bờ Hồ Nước Trong Xanh",
            position: { x: -8, z: 36 },
            color: 0x20BF6B,
            spotColor: 0xF7B731,
            soundType: "turtle",
            soundText: "Chào bé! Rùa bò chậm mà chắc!",
            letterUpper: "R",
            letterLower: "r",
            phonetic: "Phát âm: Rờ",
            voiceLetter: "Chữ Rờ. Phát âm là Rờ.",
            word: "RÙA VÀNG",
            mainSyllable: "RÙA",
            spellingTokens: ["R", "U - A (UA)", "RUA", "Huyền", "RÙA"],
            voiceSpelling: ["Rờ", "U A Ua", "Rờ Ua Rua", "Huyền", "Rùa! Bạn Rùa Vàng!"],
            sentence: "Bạn rùa vàng chăm chỉ tập bơi bên hồ nước mát lành.",
            fact: "Chiếc mai cứng cáp trên lưng chính là ngôi nhà di động bảo vệ bạn Rùa đấy!",
            quizzes: [
                {
                    question: "Tên của bạn 'RÙA VÀNG' bắt đầu bằng chữ cái nào?",
                    voice: "Tên của bạn Rùa Vàng bắt đầu bằng chữ cái nào?",
                    options: ["Chữ R (Rờ)", "Chữ B (Bờ)", "Chữ G (Gờ)", "Chữ V (Vờ)"],
                    correctIndex: 0
                },
                {
                    question: "Tiếng 'RÙA' có mang dấu thanh gì vậy bé?",
                    voice: "Tiếng Rùa có mang dấu thanh gì vậy bé?",
                    options: ["Dấu Huyền (`)", "Dấu Sắc (´)", "Dấu Hỏi (?)", "Dấu Ngã (~)"],
                    correctIndex: 0
                }
            ]
        },
        {
            id: "tho_trang",
            name: "Thỏ Trắng",
            emoji: "🐰",
            zoneName: "Vườn Cà Rốt Phía Tây",
            position: { x: -34, z: 22 },
            color: 0xFFFFFF,
            spotColor: 0xFF9FF3,
            soundType: "rabbit",
            soundText: "Nhảy tưng tưng! Ngoạm cà rốt!",
            letterUpper: "T",
            letterLower: "t",
            phonetic: "Phát âm: Tờ",
            voiceLetter: "Chữ Tờ. Phát âm là Tờ.",
            word: "THỎ TRẮNG",
            mainSyllable: "THỎ",
            spellingTokens: ["TH", "O", "THO", "Hỏi", "THỎ"],
            voiceSpelling: ["Thờ", "O", "Thờ O Tho", "Hỏi", "Thỏ! Bạn Thỏ Trắng!"],
            sentence: "Bạn thỏ trắng có đôi tai dài và rất thích ăn củ cà rốt đỏ.",
            fact: "Đôi tai dài của Thỏ giúp bạn ấy nghe được những âm thanh từ rất xa trong khu rừng!",
            quizzes: [
                {
                    question: "Chữ cái đầu tiên trong từ 'THỎ TRẮNG' là chữ gì?",
                    voice: "Chữ cái đầu tiên trong từ Thỏ Trắng là chữ gì?",
                    options: ["Chữ T (Tờ)", "Chữ C (Cờ)", "Chữ H (Hờ)", "Chữ M (Mờ)"],
                    correctIndex: 0
                },
                {
                    question: "Khi ghép âm 'TH' + âm 'O' + dấu 'Hỏi', ta đọc là gì?",
                    voice: "Khi ghép âm Thờ, âm O và dấu Hỏi, ta đọc là gì?",
                    options: ["THỎ", "TO", "CỎ", "BÒ"],
                    correctIndex: 0
                }
            ]
        },
        {
            id: "voi_con",
            name: "Voi Bản Đôn",
            emoji: "🐘",
            zoneName: "Rừng Cây Cổ Thụ",
            position: { x: -38, z: -8 },
            color: 0x778CA3,
            spotColor: 0xD1D8E0,
            soundType: "elephant",
            soundText: "U... ơ... rống vang!",
            letterUpper: "V",
            letterLower: "v",
            phonetic: "Phát âm: Vờ",
            voiceLetter: "Chữ Vờ. Phát âm là Vờ.",
            word: "VOI CON",
            mainSyllable: "VOI",
            spellingTokens: ["V", "O - I (OI)", "VOI", "Thanh Ngang", "VOI"],
            voiceSpelling: ["Vờ", "O I Oi", "Vờ Oi Voi", "Voi! Chú Voi Con!"],
            sentence: "Chú voi con ở Bản Đôn dùng chiếc vòi dài phun nước mát.",
            fact: "Chiếc vòi của Voi rất khéo léo, vừa dùng để thở, uống nước, lại vừa hái được mía ngọt!",
            quizzes: [
                {
                    question: "Chữ 'V v' được phát âm như thế nào trong Tiếng Việt?",
                    voice: "Chữ V trong Tiếng Việt được phát âm như thế nào?",
                    options: ["Phát âm là Vờ", "Phát âm là Bờ", "Phát âm là Rờ", "Phát âm là Mờ"],
                    correctIndex: 0
                },
                {
                    question: "Bé hãy đánh vần tiếng 'VOI' nhé!",
                    voice: "Bé hãy chọn cách đánh vần tiếng Voi đúng nhé!",
                    options: [
                        "Vờ - Oi - VOI",
                        "Bờ - Oi - BOI",
                        "Cờ - Oi - COI",
                        "Tờ - Oi - TOI"
                    ],
                    correctIndex: 0
                }
            ]
        },
        {
            id: "huou_sao",
            name: "Hươu Cao Cổ",
            emoji: "🦒",
            zoneName: "Đồi Nắng Vàng Tây Bắc",
            position: { x: -24, z: -32 },
            color: 0xF7B731,
            spotColor: 0xA55EEA,
            soundType: "giraffe",
            soundText: "Hươu vươn cổ cao chào bé!",
            letterUpper: "H",
            letterLower: "h",
            phonetic: "Phát âm: Hờ",
            voiceLetter: "Chữ Hờ. Phát âm là Hờ.",
            word: "HƯƠU HOA",
            mainSyllable: "HOA",
            spellingTokens: ["H", "O - A (OA)", "HOA", "Thanh Ngang", "HOA"],
            voiceSpelling: ["Hờ", "O A Oa", "Hờ Oa Hoa", "Hoa! Bạn Hươu Hoa!"],
            sentence: "Bạn hươu cao cổ vươn chiếc cổ dài hái lá xanh trên ngọn cây.",
            fact: "Hươu cao cổ là loài động vật cao nhất trên cạn, chiếc cổ giúp bạn ấy nhìn khắp công viên!",
            quizzes: [
                {
                    question: "Tên bạn 'HƯƠU' và từ 'HOA' đều bắt đầu bằng chữ cái nào?",
                    voice: "Đố bé, tên bạn Hươu và từ Hoa đều bắt đầu bằng chữ cái nào?",
                    options: ["Chữ H (Hờ)", "Chữ G (Gờ)", "Chữ C (Cờ)", "Chữ T (Tờ)"],
                    correctIndex: 0
                },
                {
                    question: "Ghép âm 'H' với vần 'OA' ta được tiếng gì?",
                    voice: "Ghép âm Hờ với vần Oa, ta được tiếng gì?",
                    options: ["Tiếng HOA", "Tiếng LOA", "Tiếng QUA", "Tiếng NGA"],
                    correctIndex: 0
                }
            ]
        }
    ]
};

