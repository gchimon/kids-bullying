// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- הגדרות גלובליות ---
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
let currentSceneIndex = 0;
let selectedOptionIndex = -1;
let score = 0;
let playerCharacterColor = 'blue'; // צבע ברירת מחדל של השחקן

// --- נתוני שפה ---
// בכל מקום שהיה בו שימוש ב-translations[currentLanguage] או scenes, יש להחליף ל-window.currentDict.game או window.currentDict.game.scenes בהתאמה.

// --- נתוני סצנות (משתמשים במפתחות של translations) ---
// בכל מקום שהיה בו שימוש ב-translations[currentLanguage] או scenes, יש להחליף ל-window.currentDict.game או window.currentDict.game.scenes בהתאמה.
const scenes = [
    {
        id: 0,
        background: 'lightblue',
        getText: () => window.currentDict.game.scene1_text,
        character1: { x: 100, y: 350, color: 'purple', name: 'ילד 1' },
        character2: { x: 300, y: 350, color: 'orange', name: 'ילד 2' },
        options: [
            { textKey: 'scene1_option1', action: 'good', explanationKey: 'scene1_explanation1' },
            { textKey: 'scene1_option2', action: 'bad', explanationKey: 'scene1_explanation2' },
            { textKey: 'scene1_option3', action: 'bad', explanationKey: 'scene1_explanation3' }
        ]
    },
    {
        id: 1,
        background: 'lightgreen',
        getText: () => window.currentDict.game.scene2_text,
        character1: { x: 150, y: 350, color: 'brown', name: 'ילדה 1' },
        character2: { x: 400, y: 350, color: 'pink', name: 'ילדה 2' },
        options: [
            { textKey: 'scene2_option1', action: 'good', explanationKey: 'scene2_explanation1' },
            { textKey: 'scene2_option2', action: 'bad', explanationKey: 'scene2_explanation2' },
            { textKey: 'scene2_option3', action: 'bad', explanationKey: 'scene2_explanation3' }
        ]
    },
    {
        id: 2,
        background: '#ADD8E6', // Light Blue
        getText: () => window.currentDict.game.scene3_text,
        character1: { x: 200, y: 350, color: 'gray', name: 'ילד חדש' },
        character2: { x: 450, y: 350, color: 'red', name: 'בריון' },
        options: [
            { textKey: 'scene3_option1', action: 'good', explanationKey: 'scene3_explanation1' },
            { textKey: 'scene3_option2', action: 'bad', explanationKey: 'scene3_explanation2' },
            { textKey: 'scene3_option3', action: 'good', explanationKey: 'scene3_explanation3' }
        ]
    }
    // ניתן להוסיף כאן סצנות נוספות
];

let gameState = 'start'; // 'start', 'customize', 'playing', 'result'

// --- פונקציות עזר לציור ---

// פונקציית ציור דמות בסיסית (איש גפרורים משופר)
function drawCharacter(x, y, color, scale = 1) {
    ctx.fillStyle = color;

    // ראש
    ctx.beginPath();
    ctx.arc(x, y - 50 * scale, 30 * scale, 0, Math.PI * 2);
    ctx.fill();

    // גוף
    ctx.fillRect(x - 10 * scale, y - 50 * scale, 20 * scale, 80 * scale);

    // ידיים
    ctx.fillRect(x - 50 * scale, y - 30 * scale, 100 * scale, 10 * scale);

    // רגליים
    ctx.fillRect(x - 40 * scale, y + 30 * scale, 20 * scale, 60 * scale);
    ctx.fillRect(x + 20 * scale, y + 30 * scale, 20 * scale, 60 * scale);
}

// --- מסכי המשחק השונים ---

function drawStartScreen() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#CCE8F4'; // רקע נעים
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'darkblue';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(window.currentDict.game.title, GAME_WIDTH / 2, GAME_HEIGHT / 4);

    // בחירת שפה
    ctx.font = '25px Arial';
    ctx.fillText(window.currentDict.game.select_language, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);

    const langOptions = ['he', 'en', 'fr'];
    const langNames = { 'he': 'עברית', 'en': 'English', 'fr': 'Français' };
    const langButtonWidth = 120;
    const langButtonHeight = 50;
    const langStartX = (GAME_WIDTH - langOptions.length * (langButtonWidth + 20)) / 2;

    langOptions.forEach((lang, index) => {
        const x = langStartX + index * (langButtonWidth + 20);
        const y = GAME_HEIGHT / 2 - 20;
        ctx.fillStyle = (window.currentDict.game.currentLanguage === lang) ? '#4CAF50' : 'lightgray';
        ctx.fillRect(x, y, langButtonWidth, langButtonHeight);
        ctx.strokeStyle = 'darkgray';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, langButtonWidth, langButtonHeight);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(langNames[lang], x + langButtonWidth / 2, y + langButtonHeight / 2 + 8);
    });

    // כפתור התחל משחק
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT * 0.7, 200, 70);
    ctx.fillStyle = 'white';
    ctx.font = '35px Arial';
    ctx.fillText(window.currentDict.game.start_game, GAME_WIDTH / 2, GAME_HEIGHT * 0.7 + 45);
}

function drawCustomizeScreen() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#E8F6F9'; // רקע בהיר
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'darkblue';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(window.currentDict.game.choose_color, GAME_WIDTH / 2, 100);

    // ציור דמות השחקן עם הצבע הנבחר
    drawCharacter(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, playerCharacterColor, 1.2);

    // אפשרויות צבע
    const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
    const colorBoxSize = 50;
    const startX = (GAME_WIDTH - colors.length * (colorBoxSize + 20)) / 2;

    colors.forEach((color, index) => {
        const x = startX + index * (colorBoxSize + 20);
        const y = GAME_HEIGHT - 200;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, colorBoxSize, colorBoxSize);
        ctx.strokeStyle = (playerCharacterColor === color) ? 'black' : 'gray';
        ctx.lineWidth = (playerCharacterColor === color) ? 5 : 2;
        ctx.strokeRect(x, y, colorBoxSize, colorBoxSize);
    });

    // כפתור התחל משחק
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT - 100, 200, 70);
    ctx.fillStyle = 'white';
    ctx.font = '35px Arial';
    ctx.fillText(window.currentDict.game.start_game, GAME_WIDTH / 2, GAME_HEIGHT - 55);
}

function drawGameScreen() {
    const current = scenes[currentSceneIndex];

    // רקע
    ctx.fillStyle = current.background;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // ציור דמויות (נניח שהדמות הראשונה היא ה"קורבן", השנייה היא ה"מציק")
    drawCharacter(current.character1.x, current.character1.y, current.character1.color);
    drawCharacter(current.character2.x, current.character2.y, current.character2.color);
    // ציור דמות השחקן בצד, כביכול הוא הצופה או המגיב
    drawCharacter(GAME_WIDTH - 150, GAME_HEIGHT - 150, playerCharacterColor);


    // אנימציה בסיסית: עיניים לדמויות
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(current.character1.x - 10, current.character1.y - 60, 5, 0, Math.PI * 2);
    ctx.arc(current.character1.x + 10, current.character1.y - 60, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(current.character2.x - 10, current.character2.y - 60, 5, 0, Math.PI * 2);
    ctx.arc(current.character2.x + 10, current.character2.y - 60, 5, 0, Math.PI * 2);
    ctx.fill();

    // טקסט המצב
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(current.getText(), GAME_WIDTH / 2, 100);

    // אפשרויות תגובה
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    const optionWidth = 220;
    const optionHeight = 60;
    const startX = (GAME_WIDTH - optionWidth * current.options.length - (current.options.length - 1) * 20) / 2; // מרכוז האפשרויות

    current.options.forEach((option, index) => {
        const x = startX + index * (optionWidth + 20);
        const y = 450;
        ctx.fillStyle = (selectedOptionIndex === index) ? 'gold' : 'lightgray';
        ctx.fillRect(x, y, optionWidth, optionHeight);
        ctx.strokeStyle = 'darkgray';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, optionWidth, optionHeight);

        ctx.fillStyle = 'black';
        ctx.fillText(window.currentDict.game[option.textKey], x + 10, y + 35);
    });

    // כפתור אישור
    ctx.fillStyle = 'green';
    ctx.fillRect(GAME_WIDTH / 2 - 75, 530, 150, 50);
    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(window.currentDict.game.confirm_button, GAME_WIDTH / 2, 565);

    // הצגת ניקוד
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${window.currentDict.game.score_label}${score}`, 20, 30);
}

function drawResultScreen(result) {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = (result.action === 'good') ? '#D4EDDA' : '#F8D7DA'; // רקע בהתאם לתוצאה
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(window.currentDict.game[result.explanationKey], GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);

    if (result.action === 'good') {
        ctx.fillStyle = '#28A745'; // ירוק כהה
        ctx.font = '40px Arial';
        ctx.fillText(window.currentDict.game.good_job, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
    } else {
        ctx.fillStyle = '#DC3545'; // אדום כהה
        ctx.font = '40px Arial';
        ctx.fillText(window.currentDict.game.try_again, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
    }

    // כפתור להמשך או לנסות שוב
    ctx.fillStyle = '#007BFF'; // כחול
    ctx.fillRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 80, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.fillText(window.currentDict.game.continue_button, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120);
}

function drawEndScreen() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#E0F7FA'; // רקע
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'darkblue';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(window.currentDict.game.end_game_message, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);

    ctx.fillStyle = 'green';
    ctx.font = '50px Arial';
    ctx.fillText(`${window.currentDict.game.score_label}${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);

    // אפשרות להתחיל מחדש
    ctx.fillStyle = '#6C757D'; // אפור
    ctx.fillRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 100, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.fillText(window.currentDict.game.start_game, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140);
}

// --- לולאת המשחק הראשית ---
function gameLoop() {
    switch (gameState) {
        case 'start':
            drawStartScreen();
            break;
        case 'customize':
            drawCustomizeScreen();
            break;
        case 'playing':
            drawGameScreen();
            break;
        case 'result':
            // המסך נשאר קפוא עד שהטיימר מעביר אותו הלאה
            break;
        case 'end':
            drawEndScreen();
            break;
    }
}

// --- טיפול בקליקים ---
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (gameState === 'start') {
        // לחיצה על כפתור התחל משחק
        if (x >= GAME_WIDTH / 2 - 100 && x <= GAME_WIDTH / 2 + 100 && y >= GAME_HEIGHT * 0.7 && y <= GAME_HEIGHT * 0.7 + 70) {
            gameState = 'customize';
            gameLoop();
            return;
        }

        // לחיצה על בחירת שפה
        const langOptions = ['he', 'en', 'fr'];
        const langButtonWidth = 120;
        const langButtonHeight = 50;
        const langStartX = (GAME_WIDTH - langOptions.length * (langButtonWidth + 20)) / 2;

        langOptions.forEach((lang, index) => {
            const btnX = langStartX + index * (langButtonWidth + 20);
            const btnY = GAME_HEIGHT / 2 - 20;
            if (x >= btnX && x <= btnX + langButtonWidth && y >= btnY && y <= btnY + langButtonHeight) {
                window.currentDict.game.currentLanguage = lang;
                drawStartScreen(); // צייר מחדש עם השפה החדשה
            }
        });

    } else if (gameState === 'customize') {
        // לחיצה על בחירת צבע
        const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
        const colorBoxSize = 50;
        const startX = (GAME_WIDTH - colors.length * (colorBoxSize + 20)) / 2;

        colors.forEach((color, index) => {
            const boxX = startX + index * (colorBoxSize + 20);
            const boxY = GAME_HEIGHT - 200;
            if (x >= boxX && x <= boxX + colorBoxSize && y >= boxY && y <= boxY + colorBoxSize) {
                playerCharacterColor = color;
                drawCustomizeScreen(); // צייר מחדש עם הצבע החדש
            }
        });

        // לחיצה על כפתור התחל משחק
        if (x >= GAME_WIDTH / 2 - 100 && x <= GAME_WIDTH / 2 + 100 && y >= GAME_HEIGHT - 100 && y <= GAME_HEIGHT - 30) {
            gameState = 'playing';
            score = 0; // איפוס ניקוד
            currentSceneIndex = 0; // איפוס סצנות
            selectedOptionIndex = -1; // איפוס בחירה
            gameLoop();
        }

    } else if (gameState === 'playing') {
        const current = scenes[currentSceneIndex];

        // בדיקה אם נלחץ על אחת מהאפשרויות
        const optionWidth = 220;
        const optionHeight = 60;
        const startX = (GAME_WIDTH - optionWidth * current.options.length - (current.options.length - 1) * 20) / 2;

        current.options.forEach((option, index) => {
            const optX = startX + index * (optionWidth + 20);
            const optY = 450;
            if (x >= optX && x <= optX + optionWidth && y >= optY && y <= optY + optionHeight) {
                selectedOptionIndex = index;
                drawGameScreen(); // ציור מחדש כדי להדגיש את הבחירה
            }
        });

        // בדיקה אם נלחץ על כפתור "אישור"
        if (x >= GAME_WIDTH / 2 - 75 && x <= GAME_WIDTH / 2 + 75 && y >= 530 && y <= 580) {
            if (selectedOptionIndex !== -1) {
                const chosenOption = current.options[selectedOptionIndex];
                gameState = 'result';
                drawResultScreen(chosenOption);

                setTimeout(() => {
                    if (chosenOption.action === 'good') {
                        score += 100; // הוסף נקודות לתשובה נכונה
                        currentSceneIndex++;
                        if (currentSceneIndex < scenes.length) {
                            selectedOptionIndex = -1; // איפוס בחירה
                            gameState = 'playing';
                            gameLoop();
                        } else {
                            // סיום המשחק
                            gameState = 'end';
                            gameLoop();
                        }
                    } else {
                        // אם זו תשובה שגויה, נשארים באותה סצנה כדי לנסות שוב
                        selectedOptionIndex = -1; // איפוס בחירה
                        gameState = 'playing';
                        gameLoop();
                    }
                }, 2000); // הצג תוצאה למשך 2 שניות
            }
        }
    } else if (gameState === 'end') {
        // לחיצה על כפתור התחל משחק מחדש
        if (x >= GAME_WIDTH / 2 - 100 && x <= GAME_WIDTH / 2 + 100 && y >= GAME_HEIGHT / 2 + 100 && y <= GAME_HEIGHT / 2 + 160) {
            gameState = 'start';
            gameLoop();
        }
    }
});

// התחל את לולאת המשחק
// פונקציה חדשה לאתחול המשחק במודל
function startGame(language) {
    window.currentDict.game.currentLanguage = language || 'he';
    gameState = 'start';
    score = 0;
    currentSceneIndex = 0;
    selectedOptionIndex = -1;
    gameLoop();
}

// פונקציה לסגירת המשחק (אפשר להרחיב לפי צורך)
function closeGame() {
    // אפשר לאפס משתנים או להסתיר את הקנבס במודל
    gameState = 'start';
    // לא מצייר כלום, המודל יוסתר ב-JS חיצוני
}