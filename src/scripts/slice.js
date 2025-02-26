import * as PIXI from "pixi.js";

async function initSliceGame() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: "#f1f1ef",
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    document.getElementById("slice").appendChild(app.canvas);

    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;
    const radius = 100;
    let currentLevel = 1;
    const maxLevel = 10;
    const startSliceAngle = Math.PI / 2; // 1/4 of the circle
    const endSliceAngle = 0.05; // Tiny sliver at level 10
    let currentSliceAngle =
        startSliceAngle -
        (currentLevel - 1) *
            ((startSliceAngle - endSliceAngle) / (maxLevel - 1));
    let rotationSpeed = 0.05; // Start speed
    const maxSpeed = 0.15; // Max speed at level 10

    const levelDisplay = new PIXI.Text({
        text: `Level: ${currentLevel}`,
        style: {
            fill: "#000000",
            fontSize: 24,
            fontFamily: "Arial",
        },
    });
    levelDisplay.anchor.set(0.5);
    levelDisplay.x = app.screen.width / 2;
    levelDisplay.y = 20;
    app.stage.addChild(levelDisplay);

    const circlePath = new PIXI.Graphics()
        .circle(0, 0, radius)
        .fill({ color: 0xcccccc, alpha: 0.3 });
    circlePath.x = centerX;
    circlePath.y = centerY;
    app.stage.addChild(circlePath);

    const redArrow = new PIXI.Graphics()
        .poly([
            centerX + radius,
            centerY,
            centerX + radius + 10,
            centerY - 10,
            centerX + radius + 10,
            centerY + 10,
        ])
        .fill(0xff0000);
    app.stage.addChild(redArrow);

    const sliceContainer = new PIXI.Container();
    sliceContainer.x = centerX;
    sliceContainer.y = centerY;
    app.stage.addChild(sliceContainer);

    function drawSlice() {
        sliceContainer.removeChildren();
        const slice = new PIXI.Graphics();
        slice
            .moveTo(0, 0)
            .arc(0, 0, radius, -currentSliceAngle / 2, currentSliceAngle / 2)
            .lineTo(0, 0)
            .fill(0xffd700);
        sliceContainer.addChild(slice);
    }
    drawSlice();

    let rotationActive = true;
    let gameEnded = false;

    const stopButton = document.getElementById("stop");
    stopButton.addEventListener("click", () => {
        if (!rotationActive) return;
        rotationActive = false;
        checkResult();
    });

    function isAngleInRange(angle, start, end) {
        angle = (angle + 2 * Math.PI) % (2 * Math.PI);
        start = (start + 2 * Math.PI) % (2 * Math.PI);
        end = (end + 2 * Math.PI) % (2 * Math.PI);
        if (start < end) return angle >= start && angle <= end;
        return angle >= start || angle <= end;
    }

    function checkResult() {
        const r = (sliceContainer.rotation + 2 * Math.PI) % (2 * Math.PI);
        const lower = (r - currentSliceAngle / 2 + 2 * Math.PI) % (2 * Math.PI);
        const upper = (r + currentSliceAngle / 2 + 2 * Math.PI) % (2 * Math.PI);
        const success = isAngleInRange(0, lower, upper);
        if (success) {
            if (currentLevel === maxLevel) {
                showResult("YOU HAVE WON", true);
            } else {
                showResult("SUCCESS", false);
            }
        } else {
            showResult("FAIL", true);
        }
    }

    function showResult(message, waitForRestart) {
        rotationActive = false;
        const mainText = new PIXI.Text({
            text: message,
            style: {
                fill: "#000000",
                fontSize: 48,
                fontFamily: "Arial",
            },
        });
        mainText.anchor.set(0.5);
        mainText.x = centerX;
        mainText.y = centerY - 20;
        app.stage.addChild(mainText);

        if (waitForRestart) {
            const restartText = new PIXI.Text({
                text: "CLICK TO RESTART",
                style: {
                    fill: "#000000",
                    fontSize: 24,
                    fontFamily: "Arial",
                },
            });
            restartText.anchor.set(0.5);
            restartText.x = centerX;
            restartText.y = centerY + 40;
            app.stage.addChild(restartText);
            app.stage.interactive = true;
            app.stage.once("pointerdown", () => {
                app.stage.interactive = false;
                app.stage.removeChild(mainText);
                app.stage.removeChild(restartText);
                resetGame();
            });
        } else {
            setTimeout(() => {
                app.stage.removeChild(mainText);
                advanceLevel();
            }, 2000);
        }
    }

    function advanceLevel() {
        currentLevel++;
        updateLevelDisplay();
        currentSliceAngle =
            startSliceAngle -
            (currentLevel - 1) *
                ((startSliceAngle - endSliceAngle) / (maxLevel - 1));
        rotationSpeed =
            0.03 + (currentLevel - 1) * ((maxSpeed - 0.03) / (maxLevel - 1)); // Speed increases with level
        drawSlice();
        sliceContainer.rotation = 0;
        rotationActive = true;
    }

    function updateLevelDisplay() {
        levelDisplay.text = `Level: ${currentLevel}`;
    }

    function resetGame() {
        currentLevel = 1;
        updateLevelDisplay();
        currentSliceAngle = startSliceAngle;
        rotationSpeed = 0.03;
        drawSlice();
        sliceContainer.rotation = 0;
        rotationActive = true;
        gameEnded = false;
    }

    app.ticker.add(() => {
        if (rotationActive) {
            sliceContainer.rotation += rotationSpeed;
        }
    });
}

initSliceGame();
