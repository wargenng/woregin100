import * as PIXI from "pixi.js";

async function initFindGame() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: "#f1f1ef",
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    await PIXI.Assets.load("/fonts/ww.ttf");
    document.getElementById("find").innerHTML = "";
    document.getElementById("find").appendChild(app.canvas);

    const fruits = ["🍎", "🍌", "🍇", "🍒", "🍉"];
    let currentRound = 1;
    const maxRounds = Infinity;
    let targetEmoji = "";
    let roundTimer;
    const boardContainer = new PIXI.Container();
    boardContainer.sortableChildren = true;
    app.stage.addChild(boardContainer);

    const roundDisplay = new PIXI.Text({
        text: `Round: ${currentRound}`,
        style: { fill: "#000000", fontSize: 24, fontFamily: "ww" },
    });
    roundDisplay.anchor.set(0, 0);
    roundDisplay.x = 10;
    roundDisplay.y = 10;
    app.stage.addChild(roundDisplay);

    const globalTimer = new PIXI.Text({
        text: "",
        style: { fill: "#000000", fontSize: 24, fontFamily: "ww" },
    });
    globalTimer.anchor.set(0.5);
    globalTimer.x = app.screen.width / 2;
    globalTimer.y = 23;

    function updateRoundDisplay() {
        roundDisplay.text = `Round: ${currentRound}`;
    }

    function showInitialTarget() {
        boardContainer.removeChildren();
        targetEmoji = fruits[Math.floor(Math.random() * fruits.length)];
        const targetText = new PIXI.Text({
            text: targetEmoji,
            style: { fill: "#000000", fontSize: 96, fontFamily: "ww" },
        });
        targetText.anchor.set(0.5);
        targetText.x = app.screen.width / 2;
        targetText.y = app.screen.height / 2;
        boardContainer.addChild(targetText);

        targetText.interactive = true;
        targetText.buttonMode = true;
        targetText.on("pointerdown", () => {
            boardContainer.removeChildren();
            showFindPrompt();
        });
    }

    function showFindPrompt() {
        const findText = new PIXI.Text({
            text: "FIND",
            style: { fill: "#000000", fontSize: 48, fontFamily: "ww" },
        });
        findText.anchor.set(0.5);
        findText.x = app.screen.width / 2;
        findText.y = app.screen.height / 2;
        boardContainer.addChild(findText);
        setTimeout(spawnBoard, 500);
    }

    function spawnBoard() {
        boardContainer.removeChildren();
        boardContainer.addChild(globalTimer);

        const boardX = 20;
        const boardY = 100;
        const boardWidth = app.screen.width - 40;
        const boardHeight = app.screen.height - 120;

        const numDistractors = 4 + (currentRound - 1) * 4;
        for (let i = 0; i < numDistractors; i++) {
            let distractor;
            do {
                distractor = fruits[Math.floor(Math.random() * fruits.length)];
            } while (distractor === targetEmoji);
            spawnCard(
                distractor,
                false,
                boardX,
                boardY,
                boardWidth,
                boardHeight
            );
        }
        spawnCard(targetEmoji, true, boardX, boardY, boardWidth, boardHeight);

        let timeRemaining = 5;
        globalTimer.text = `${timeRemaining}`;
        roundTimer = setInterval(() => {
            timeRemaining--;
            globalTimer.text = `${timeRemaining}`;
            if (timeRemaining <= 0) {
                clearInterval(roundTimer);
                gameOver("Time's up!");
            }
        }, 1000);
    }

    function spawnCard(
        emoji,
        isTarget,
        boardX,
        boardY,
        boardWidth,
        boardHeight
    ) {
        const card = new PIXI.Text({
            text: emoji,
            style: { fill: "#000000", fontSize: 48, fontFamily: "ww" },
        });
        card.anchor.set(0.5);
        card.x = Math.random() * boardWidth + boardX;
        card.y = Math.random() * boardHeight + boardY;
        card.interactive = true;
        card.buttonMode = true;

        if (isTarget) {
            card.zIndex = 1;
            card.hitArea = new PIXI.Rectangle(-30, -30, 60, 60);
        }

        card.on("pointerdown", () => {
            clearInterval(roundTimer);
            let children = boardContainer.children.slice();
            children.forEach((child) => {
                if (child !== card) boardContainer.removeChild(child);
            });

            if (isTarget) {
                if (globalTimer.parent) boardContainer.removeChild(globalTimer);
                roundSuccess();
            } else {
                if (globalTimer.parent) boardContainer.removeChild(globalTimer);
                setTimeout(() => {
                    gameOver(`Wrong! Target: ${targetEmoji}`);
                }, 300);
            }
        });
        boardContainer.addChild(card);
    }

    function roundSuccess() {
        showResult("SUCCESS!");
        setTimeout(() => {
            currentRound++;
            updateRoundDisplay();
            showInitialTarget();
        }, 500);
    }

    function gameOver(message) {
        showResult(message, true);
    }

    function showResult(message, waitForRestart = false) {
        const resultText = new PIXI.Text({
            text: message,
            style: { fill: "#ff0000", fontSize: 48, fontFamily: "ww" },
        });
        resultText.anchor.set(0.5);
        resultText.x = app.screen.width / 2;
        resultText.y = app.screen.height / 2;
        boardContainer.addChild(resultText);

        if (waitForRestart) {
            const restartText = new PIXI.Text({
                text: "CLICK TO RESTART",
                style: { fill: "#ff0000", fontSize: 24, fontFamily: "ww" },
            });
            restartText.anchor.set(0.5);
            restartText.x = app.screen.width / 2;
            restartText.y = app.screen.height / 2 + 60;
            boardContainer.addChild(restartText);

            boardContainer.interactive = true;
            boardContainer.once("pointerdown", () => {
                boardContainer.interactive = false;
                currentRound = 1;
                showInitialTarget();
            });
        }
    }

    showInitialTarget();
}

initFindGame();
