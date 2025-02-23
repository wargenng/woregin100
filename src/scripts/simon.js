import * as PIXI from "pixi.js";

async function initSimon() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    document.getElementById("simon").appendChild(app.canvas);

    const timerButton = document.getElementById("timer");

    const buttonsData = [
        { id: 0, base: 0xff3b30, flash: 0xff6b5b },
        { id: 1, base: 0x34c759, flash: 0x6cd98d },
        { id: 2, base: 0x007aff, flash: 0x66a3ff },
        { id: 3, base: 0xffcc00, flash: 0xffdd55 },
    ];

    const positions = [
        { x: 0, y: 0 },
        { x: 190, y: 0 },
        { x: 0, y: 190 },
        { x: 190, y: 190 },
    ];

    const buttons = [];
    for (let i = 0; i < 4; i++) {
        const gfx = new PIXI.Graphics()
            .rect(0, 0, 190, 190)
            .fill(buttonsData[i].base);
        gfx.x = positions[i].x;
        gfx.y = positions[i].y;
        gfx.interactive = true;
        gfx.buttonMode = true;
        gfx.on("pointerdown", () => onButtonClick(i));
        app.stage.addChild(gfx);
        buttons.push(gfx);
    }

    let simonSequence = [];
    let playerSequence = [];
    let awaitingInput = false;
    let overlay = null;
    let processingInput = false;

    let timerInterval = null;
    let timeRemaining = 30;

    function startTimer() {
        timeRemaining = 30;
        timerButton.textContent = timeRemaining;
        timerInterval = setInterval(() => {
            timeRemaining--;
            timerButton.textContent = timeRemaining;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                gameOver();
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerButton.textContent = "";
    }

    function showOverlay(message, clickable, callback) {
        overlay = new PIXI.Container();
        const bg = new PIXI.Graphics();
        bg.clear();
        bg.rect(0, 0, app.screen.width, app.screen.height).fill({
            color: 0x000000,
            alpha: 0.6,
        });
        overlay.addChild(bg);
        const overlayText = new PIXI.Text({
            text: message,
            style: {
                fill: "#ffffff",
                fontSize: 36,
                fontFamily: "Arial",
            },
        });
        overlayText.anchor.set(0.5);
        overlayText.x = app.screen.width / 2;
        overlayText.y = app.screen.height / 2;
        overlay.addChild(overlayText);
        app.stage.addChild(overlay);
        if (clickable) {
            overlay.interactive = true;
            overlay.buttonMode = true;
            overlay.on("pointerdown", () => {
                app.stage.removeChild(overlay);
                overlay.destroy();
                overlay = null;
                if (callback) callback();
            });
        }
    }

    function startGame() {
        simonSequence = [];
        playerSequence = [];
        setTimeout(addStep, 1000);
    }

    function addStep() {
        const randomIndex = Math.floor(Math.random() * 4);
        simonSequence.push(randomIndex);
        playSequence();
    }

    async function playSequence() {
        stopTimer();
        awaitingInput = false;
        playerSequence = [];
        for (let i = 0; i < simonSequence.length; i++) {
            await flashButton(simonSequence[i]);
            await delay(300);
        }
        awaitingInput = true;
        startTimer();
    }

    function flashButton(index) {
        return new Promise((resolve) => {
            const button = buttons[index];
            button.clear();
            button.rect(0, 0, 190, 190).fill(buttonsData[index].flash);
            setTimeout(() => {
                button.clear();
                button.rect(0, 0, 190, 190).fill(buttonsData[index].base);
                resolve();
            }, 500);
        });
    }

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function onButtonClick(index) {
        if (!awaitingInput || processingInput) return;
        processingInput = true;
        await flashButton(index);
        playerSequence.push(index);
        const currentIndex = playerSequence.length - 1;
        if (playerSequence[currentIndex] !== simonSequence[currentIndex]) {
            processingInput = false;
            gameOver();
            return;
        }
        if (playerSequence.length === simonSequence.length) {
            stopTimer();
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].clear();
                buttons[i].rect(0, 0, 190, 190).fill(buttonsData[i].flash);
            }
            await delay(500);
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].clear();
                buttons[i].rect(0, 0, 190, 190).fill(buttonsData[i].base);
            }
            awaitingInput = false;
            processingInput = false;
            await delay(500);
            addStep();
        } else {
            awaitingInput = true;
            processingInput = false;
        }
    }

    function gameOver() {
        stopTimer();
        awaitingInput = false;
        showOverlay("GAME OVER", false, null);
        setTimeout(() => {
            if (overlay) {
                app.stage.removeChild(overlay);
                overlay.destroy();
                overlay = null;
            }
            const score = simonSequence.length - 1;
            showOverlay(`SCORE: ${score}\nCLICK TO START`, true, startGame);
        }, 2000);
    }

    showOverlay("CLICK TO START", true, startGame);
}

initSimon();
