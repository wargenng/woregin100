import * as PIXI from "pixi.js";

async function initGame() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: 0xf1f1ef,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    document.getElementById("fruit").appendChild(app.canvas);

    let points = 0;
    let lives = 3;
    const plusOneMessages = [];

    const pointsDisplay = new PIXI.Text({
        text: `${points}`,
        style: {
            fill: "#000000",
            fontSize: 24,
            fontFamily: "Arial",
        },
    });
    pointsDisplay.anchor.set(0.5);
    pointsDisplay.x = app.screen.width / 2;
    pointsDisplay.y = 20;
    app.stage.addChild(pointsDisplay);

    const livesDisplay = new PIXI.Text({
        text: `❤️ ❤️ ❤️`,
        style: {
            fill: "#000000",
            fontSize: 24,
            fontFamily: "Arial",
        },
    });
    livesDisplay.anchor.set(0, 0);
    livesDisplay.x = 10;
    livesDisplay.y = 10;
    app.stage.addChild(livesDisplay);

    const foodEmojis = ["🍎", "🍌", "🍇", "🍒", "🍉"];
    const bombEmoji = "💣";
    let activeItems = [];

    function spawnItem() {
        const isBomb = Math.random() < 0.2;
        const emoji = isBomb
            ? bombEmoji
            : foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
        const type = isBomb ? "bomb" : "food";
        const item = new PIXI.Text({
            text: emoji,
            style: {
                fill: "#000000",
                fontSize: 48,
                fontFamily: "Arial",
            },
        });
        item.anchor.set(0.5);
        item.x = Math.random() * (app.screen.width - 40) + 20;
        item.y = app.screen.height + 20;
        item.type = type;
        item.vx = Math.random() * 100 - 50;
        item.vy = -(600 + Math.random() * 50);
        item.interactive = true;
        item.buttonMode = true;
        item.on("pointerdown", () => onItemClick(item));
        app.stage.addChild(item);
        activeItems.push(item);
    }

    function onItemClick(item) {
        if (!activeItems.includes(item)) return;
        app.stage.removeChild(item);
        activeItems = activeItems.filter((i) => i !== item);
        if (item.type === "food") {
            points++;
            updatePoints();
            showPlusOne(item.x, item.y);
        } else if (item.type === "bomb") {
            lives--;
            updateLives();
            if (lives <= 0) {
                gameOver();
            }
        }
    }

    function updatePoints() {
        pointsDisplay.text = `${points}`;
    }

    function updateLives() {
        livesDisplay.text = Array(lives).fill("❤️").join(" ");
    }

    function showPlusOne(x, y) {
        const plusOne = new PIXI.Text({
            text: "+1",
            style: {
                fill: "#00aa00",
                fontSize: 24,
                fontFamily: "Arial",
            },
        });
        plusOne.anchor.set(0.5);
        plusOne.x = x;
        plusOne.y = y;
        plusOne.alpha = 1;
        app.stage.addChild(plusOne);
        plusOneMessages.push({ text: plusOne, lifetime: 1.0 });
    }

    let spawnInterval = setInterval(spawnItem, 1000);

    function gameOver() {
        clearInterval(spawnInterval);
        for (const item of activeItems) {
            app.stage.removeChild(item);
        }
        activeItems = [];
        const overlay = new PIXI.Text({
            text: "GAME OVER\nCLICK TO RESTART",
            style: {
                fill: "#ff0000",
                fontSize: 30,
                fontFamily: "Arial",
            },
        });
        overlay.anchor.set(0.5);
        overlay.x = app.screen.width / 2;
        overlay.y = app.screen.height / 2;
        overlay.interactive = true;
        overlay.buttonMode = true;
        overlay.on("pointerdown", () => {
            app.stage.removeChild(overlay);
            resetGame();
            spawnInterval = setInterval(spawnItem, 1000);
        });
        app.stage.addChild(overlay);
    }

    function resetGame() {
        points = 0;
        lives = 3;
        updatePoints();
        updateLives();
    }

    app.ticker.add((delta) => {
        const dt = delta.deltaTime / 60;
        for (const item of activeItems) {
            item.vy += 600 * dt;
            item.x += item.vx * dt;
            item.y += item.vy * dt;
        }
        activeItems = activeItems.filter((item) => {
            if (
                item.y < -50 ||
                item.y > app.screen.height + 50 ||
                item.x < -50 ||
                item.x > app.screen.width + 50
            ) {
                app.stage.removeChild(item);
                return false;
            }
            return true;
        });
        for (let i = plusOneMessages.length - 1; i >= 0; i--) {
            plusOneMessages[i].lifetime -= dt;
            plusOneMessages[i].text.alpha = plusOneMessages[i].lifetime;
            plusOneMessages[i].text.y -= 20 * dt;
            if (plusOneMessages[i].lifetime <= 0) {
                app.stage.removeChild(plusOneMessages[i].text);
                plusOneMessages.splice(i, 1);
            }
        }
    });
}

initGame();
