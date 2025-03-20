import * as PIXI from "pixi.js";

async function initGame() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundColor: "#f1f1ef",
    });
    document.getElementById("square").appendChild(app.canvas);

    const groundY = app.screen.height - 20;

    const player = new PIXI.Graphics().rect(0, 0, 20, 20).fill(0x010101);
    player.x = 50;
    player.y = groundY - 20;
    app.stage.addChild(player);

    const ground = new PIXI.Graphics()
        .rect(0, groundY, app.screen.width, 20)
        .fill(0x000000);
    app.stage.addChild(ground);

    let score = 0;
    const scoreText = new PIXI.Text({
        text: "Score: 0",
        style: { fontSize: 16, fill: 0x000000 },
    });
    scoreText.x = 10;
    scoreText.y = 10;
    app.stage.addChild(scoreText);

    let velocityY = 0;
    const gravity = 0.5;
    const jumpForce = -10;
    let isJumping = false;
    let obstacles = [];
    let obstacleTimer = 0;
    const obstacleInterval = 90;
    let gameOver = false;

    function spawnObstacle() {
        const obsWidth = 20;
        const obsHeight = 20 + Math.random() * 30;
        const obstacle = new PIXI.Graphics()
            .rect(0, 0, obsWidth, obsHeight)
            .fill(0x000000);
        obstacle.x = app.screen.width;
        obstacle.y = groundY - obsHeight;
        app.stage.addChild(obstacle);
        obstacles.push(obstacle);
    }

    window.addEventListener("keydown", (e) => {
        if (e.code === "Space" && !isJumping && !gameOver) {
            velocityY = jumpForce;
            isJumping = true;
        }
    });
    app.canvas.addEventListener("pointerdown", () => {
        if (!isJumping && !gameOver) {
            velocityY = jumpForce;
            isJumping = true;
        }
    });

    app.ticker.add((delta) => {
        if (gameOver) return;
        score += delta.deltaTime;
        scoreText.text = "Score: " + Math.floor(score);

        if (isJumping) {
            velocityY += gravity;
            player.y += velocityY;
            if (player.y >= groundY - 20) {
                player.y = groundY - 20;
                isJumping = false;
                velocityY = 0;
            }
        }

        obstacleTimer += delta.deltaTime;
        if (obstacleTimer >= obstacleInterval) {
            obstacleTimer = 0;
            spawnObstacle();
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= 5 * delta.deltaTime;
            if (obstacles[i].x + obstacles[i].width < 0) {
                app.stage.removeChild(obstacles[i]);
                obstacles.splice(i, 1);
            } else if (rectsIntersect(player, obstacles[i])) {
                gameOver = true;
                const gameOverText = new PIXI.Text({
                    text: "GAME OVER",
                    style: { fontSize: 36, fill: 0x000000 },
                });
                gameOverText.anchor.set(0.5);
                gameOverText.x = app.screen.width / 2;
                gameOverText.y = app.screen.height / 2;
                app.stage.addChild(gameOverText);
            }
        }
    });

    function rectsIntersect(a, b) {
        const ab = a.getBounds();
        const bb = b.getBounds();
        return (
            ab.x + ab.width > bb.x &&
            ab.x < bb.x + bb.width &&
            ab.y + ab.height > bb.y &&
            ab.y < bb.y + bb.height
        );
    }

    function resetGame() {
        score = 0;
        scoreText.text = "Score: 0";
        gameOver = false;
        isJumping = false;
        velocityY = 0;
        obstacleTimer = 0;
        player.y = groundY - 20;
        obstacles.forEach((obstacle) => {
            app.stage.removeChild(obstacle);
            obstacle.destroy();
        });
        obstacles = [];
        // Remove any "GAME OVER" text from the stage
        for (let i = app.stage.children.length - 1; i >= 0; i--) {
            const child = app.stage.children[i];
            if (child instanceof PIXI.Text && child.text === "GAME OVER") {
                app.stage.removeChild(child);
            }
        }
    }

    const resetButton = document.getElementById("reset");
    if (resetButton) {
        resetButton.addEventListener("click", resetGame);
    }

    const jumpButton = document.getElementById("jump");
    if (jumpButton) {
        jumpButton.addEventListener("click", () => {
            if (!isJumping && !gameOver) {
                velocityY = jumpForce;
                isJumping = true;
            }
        });
    }
}

initGame();
