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

// --- פונקציה לשבירת שורות ---
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = [];
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    lines.forEach((l, i) => {
        ctx.fillText(l, x, y + i * lineHeight);
    });
    return lines.length;
}

// --- פונקציה חדשה: קבלת טקסט שבור לשורות (בלי לצייר) ---
function getWrappedLines(ctx, text, maxWidth) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());
    return lines;
}

// --- פונקציה לציור בועת דיבור ---
function drawSpeechBubble(ctx, text, x, y, width, height, targetX) {
    const bubblePadding = 20;
    const arrowHeight = 20;
    const arrowWidth = 25;

    // Body
    ctx.beginPath();
    ctx.moveTo(x + 20, y);
    ctx.arcTo(x + width, y, x + width, y + height, 20);
    ctx.arcTo(x + width, y + height, x, y + height, 20);
    ctx.arcTo(x, y + height, x, y, 20);
    ctx.arcTo(x, y, x + width, y, 20);
    ctx.closePath();

    // Arrow pointing to targetX
    ctx.beginPath();
    const arrowX = Math.max(x + 15, Math.min(targetX, x + width - 15));
    ctx.moveTo(arrowX - arrowWidth / 2, y + height - 1); // -1 to hide seam
    ctx.lineTo(targetX, y + height + arrowHeight);
    ctx.lineTo(arrowX + arrowWidth / 2, y + height - 1);
    ctx.closePath();
    
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = '24px Assistant, Arial, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, text, x + width / 2, y + bubblePadding + 10, width - bubblePadding * 2, 28);
    ctx.restore();
}

// --- מסכי המשחק השונים (עם תיקוני עיצוב ומיקום) ---

function drawStartScreen() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#CCE8F4';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'darkblue';
    ctx.font = '50px Assistant, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.currentDict.game.title, GAME_WIDTH / 2, GAME_HEIGHT / 3);

    // כפתור התחל משחק - טקסט ממורכז
    const startButtonY = GAME_HEIGHT * 0.65;
    const startButtonHeight = 70;
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(GAME_WIDTH / 2 - 100, startButtonY, 200, startButtonHeight);
    ctx.fillStyle = 'white';
    ctx.font = '35px Assistant, Arial, sans-serif';
    ctx.fillText(window.currentDict.game.start_game, GAME_WIDTH / 2, startButtonY + startButtonHeight / 2);
    ctx.textBaseline = 'alphabetic'; // Reset
}

function drawCustomizeScreen() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#E8F6F9';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'darkblue';
    ctx.font = '40px Assistant, Arial, sans-serif';
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
    const custButtonY = GAME_HEIGHT - 100;
    const custButtonHeight = 70;
    ctx.fillRect(GAME_WIDTH / 2 - 100, custButtonY, 200, custButtonHeight);
    ctx.fillStyle = 'white';
    ctx.font = '35px Assistant, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.currentDict.game.start_game, GAME_WIDTH / 2, custButtonY + custButtonHeight / 2);
    ctx.textBaseline = 'alphabetic'; // Reset
}

// --- פונקציה חדשה: שליפת סצנות מהתרגום ---
function getScenes() {
    return window.currentDict?.game?.scenes || [];
}

// --- עדכון drawGameScreen: תיבות תשובה מעוצבות ושבירת שורות ---
function drawGameScreen() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // רקע מדורג עדין
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0, '#e0f7fa');
    grad.addColorStop(1, '#b2ebf2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const scenes = getScenes();
    const current = scenes[currentSceneIndex];
    if (!current) return;

    // --- קבועים חדשים למיקום וריווח ---
    const GROUND_Y = 320;
    const BUBBLE_HEIGHT = 95;
    const BUBBLE_Y = 20;
    const OPTIONS_Y = 440;
    const CONFIRM_Y = 545;

    // ציור "רצפה" לאפקט עומק
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.beginPath();
    ctx.ellipse(GAME_WIDTH / 2, GROUND_Y + 75, GAME_WIDTH / 2 - 50, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // דמויות ראשיות
    const char1X = GAME_WIDTH / 2 - 100;
    const char2X = GAME_WIDTH / 2 + 100;
    drawCharacter(char1X, GROUND_Y, current.character1.color, 1);
    drawCharacter(char2X, GROUND_Y, current.character2.color, 1);
    
    // דמות שחקן כצופה
    drawCharacter(80, GROUND_Y + 150, playerCharacterColor, 0.8);

    // בועת דיבור מעל דמות 1
    const bubbleWidth = 500;
    const bubbleX = char1X - bubbleWidth / 2 + 100;
    drawSpeechBubble(ctx, current.text, bubbleX, BUBBLE_Y, bubbleWidth, BUBBLE_HEIGHT, char1X);

    // אפשרויות תגובה - עם טקסט ממורכז
    const optionWidth = 240;
    const optionHeight = 80;
    const startX = (GAME_WIDTH - optionWidth * current.options.length - (current.options.length - 1) * 20) / 2;

    current.options.forEach((option, index) => {
        const x = startX + index * (optionWidth + 20);
        const y = OPTIONS_Y;
        
        // תיבה מעוגלת עם צבע רקע עדין
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + 16, y);
        ctx.arcTo(x + optionWidth, y, x + optionWidth, y + optionHeight, 16);
        ctx.arcTo(x + optionWidth, y + optionHeight, x, y + optionHeight, 16);
        ctx.arcTo(x, y + optionHeight, x, y, 16);
        ctx.arcTo(x, y, x + optionWidth, y, 16);
        ctx.closePath();
        ctx.fillStyle = (selectedOptionIndex === index) ? '#ffe082' : '#f5f5f5';
        ctx.shadowColor = '#bbb';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = (selectedOptionIndex === index) ? '#ffb300' : '#bbb';
        ctx.lineWidth = (selectedOptionIndex === index) ? 4 : 2;
        ctx.stroke();
        ctx.restore();
        
        // טקסט ממורכז אנכית ואופקית
        ctx.fillStyle = 'black';
        ctx.font = '20px Assistant, Arial, sans-serif';
        ctx.textAlign = 'center';
        
        const lines = getWrappedLines(ctx, option.text, optionWidth - 30);
        const lineHeight = 22;
        const totalTextHeight = lines.length * lineHeight;
        const textStartY = y + (optionHeight / 2) - (totalTextHeight / 2) + (lineHeight / 2);

        lines.forEach((line, i) => {
            ctx.fillText(line, x + optionWidth / 2, textStartY + (i * lineHeight));
        });
    });

    // כפתור אישור - מיקום מתוקן וטקסט ממורכז
    const confirmButtonHeight = 50;
    ctx.save();
    ctx.beginPath();
    const confirmButtonY = CONFIRM_Y;
    ctx.moveTo(GAME_WIDTH / 2 - 75 + 20, confirmButtonY);
    ctx.arcTo(GAME_WIDTH / 2 + 75, confirmButtonY, GAME_WIDTH / 2 + 75, confirmButtonY + confirmButtonHeight, 20);
    ctx.arcTo(GAME_WIDTH / 2 + 75, confirmButtonY + confirmButtonHeight, GAME_WIDTH / 2 - 75, confirmButtonY + confirmButtonHeight, 20);
    ctx.arcTo(GAME_WIDTH / 2 - 75, confirmButtonY + confirmButtonHeight, GAME_WIDTH / 2 - 75, confirmButtonY, 20);
    ctx.arcTo(GAME_WIDTH / 2 - 75, confirmButtonY, GAME_WIDTH / 2 + 75, confirmButtonY, 20);
    ctx.closePath();
    ctx.fillStyle = 'green';
    ctx.shadowColor = '#333';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.fillStyle = 'white';
    ctx.font = '28px Assistant, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.currentDict.game.confirm_button, GAME_WIDTH / 2, CONFIRM_Y + confirmButtonHeight / 2);
    ctx.textBaseline = 'alphabetic';

    // הצגת ניקוד
    ctx.fillStyle = 'black';
    ctx.font = '20px Assistant, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${window.currentDict.game.score_label}${score}`, 20, 30);
}

// --- עדכון drawResultScreen: תיבת תוצאה מעוצבת ושבירת שורות ---
function drawResultScreen(result) {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = (result.action === 'good') ? '#D4EDDA' : '#F8D7DA';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // תיבת תוצאה מעוגלת עם צל
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2 - 320, GAME_HEIGHT / 2 - 90);
    ctx.arcTo(GAME_WIDTH / 2 + 320, GAME_HEIGHT / 2 - 90, GAME_WIDTH / 2 + 320, GAME_HEIGHT / 2 + 90, 32);
    ctx.arcTo(GAME_WIDTH / 2 + 320, GAME_HEIGHT / 2 + 90, GAME_WIDTH / 2 - 320, GAME_HEIGHT / 2 + 90, 32);
    ctx.arcTo(GAME_WIDTH / 2 - 320, GAME_HEIGHT / 2 + 90, GAME_WIDTH / 2 - 320, GAME_HEIGHT / 2 - 90, 32);
    ctx.arcTo(GAME_WIDTH / 2 - 320, GAME_HEIGHT / 2 - 90, GAME_WIDTH / 2 + 320, GAME_HEIGHT / 2 - 90, 32);
    ctx.closePath();
    ctx.fillStyle = (result.action === 'good') ? '#e8fbe8' : '#fbe8e8';
    ctx.shadowColor = '#bbb';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.fillStyle = 'black';
    ctx.font = '30px Assistant, Arial, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, result.explanation, GAME_WIDTH / 2 - 280, GAME_HEIGHT / 2 - 40, 560, 34);

    if (result.action === 'good') {
        ctx.fillStyle = '#28A745';
        ctx.font = '40px Assistant, Arial, sans-serif';
        ctx.fillText(window.currentDict.game.good_job, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    } else {
        ctx.fillStyle = '#DC3545';
        ctx.font = '40px Assistant, Arial, sans-serif';
        ctx.fillText(window.currentDict.game.try_again, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    }

    const continueButtonY = GAME_HEIGHT / 2 + 80;
    const continueButtonHeight = 60;
    ctx.fillStyle = '#007BFF';
    ctx.fillRect(GAME_WIDTH / 2 - 100, continueButtonY, 200, continueButtonHeight);
    ctx.fillStyle = 'white';
    ctx.font = '28px Assistant, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.currentDict.game.continue_button, GAME_WIDTH / 2, continueButtonY + continueButtonHeight / 2);
    ctx.textBaseline = 'alphabetic'; // Reset baseline
}

// --- עדכון drawEndScreen ---
function drawEndScreen() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'darkblue';
    ctx.font = '40px Assistant, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(window.currentDict.game.end_game_message, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);

    ctx.fillStyle = 'green';
    ctx.font = '50px Assistant, Arial, sans-serif';
    ctx.fillText(`${window.currentDict.game.score_label}${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);

    const endButtonY = GAME_HEIGHT / 2 + 100;
    const endButtonHeight = 60;
    ctx.fillStyle = '#6C757D';
    ctx.fillRect(GAME_WIDTH / 2 - 100, endButtonY, 200, endButtonHeight);
    ctx.fillStyle = 'white';
    ctx.font = '28px Assistant, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.currentDict.game.start_game, GAME_WIDTH / 2, endButtonY + endButtonHeight / 2);
    ctx.textBaseline = 'alphabetic'; // Reset baseline
}

// --- שיפור ציור דמות: צל, מעבר צבע, פה ---
function drawCharacter(x, y, color, scale = 1) {
    ctx.save();
    // צל מתחת לדמות
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.ellipse(x, y + 70 * scale, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.globalAlpha = 1;
    // ראש עם מעבר צבע
    const grad = ctx.createRadialGradient(x, y - 50 * scale, 10 * scale, x, y - 50 * scale, 30 * scale);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - 50 * scale, 30 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // גוף
    ctx.fillStyle = color;
    ctx.fillRect(x - 10 * scale, y - 50 * scale, 20 * scale, 80 * scale);
    ctx.strokeRect(x - 10 * scale, y - 50 * scale, 20 * scale, 80 * scale);
    // ידיים
    ctx.fillRect(x - 50 * scale, y - 30 * scale, 100 * scale, 10 * scale);
    ctx.strokeRect(x - 50 * scale, y - 30 * scale, 100 * scale, 10 * scale);
    // רגליים
    ctx.fillRect(x - 40 * scale, y + 30 * scale, 20 * scale, 60 * scale);
    ctx.strokeRect(x - 40 * scale, y + 30 * scale, 20 * scale, 60 * scale);
    ctx.fillRect(x + 20 * scale, y + 30 * scale, 20 * scale, 60 * scale);
    ctx.strokeRect(x + 20 * scale, y + 30 * scale, 20 * scale, 60 * scale);
    // עיניים
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x - 10 * scale, y - 60 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.arc(x + 10 * scale, y - 60 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    // פה מחייך
    ctx.beginPath();
    ctx.arc(x, y - 40 * scale, 12 * scale, 0, Math.PI, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.restore();
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
    const scenes = getScenes();

    if (gameState === 'start') {
        // לחיצה על כפתור התחל משחק
        if (x >= GAME_WIDTH / 2 - 100 && x <= GAME_WIDTH / 2 + 100 && y >= GAME_HEIGHT * 0.65 && y <= GAME_HEIGHT * 0.65 + 70) {
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