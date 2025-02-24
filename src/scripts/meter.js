import * as PIXI from "pixi.js";

async function initMeterGame() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    document.getElementById("meter").appendChild(app.canvas);

    // Meter parameters
    const meterX = 50;
    const meterY = 40;
    const meterWidth = 50;
    const meterHeight = 300;
    const targetZoneY = meterY + 120; // target zone from y=160...
    const targetZoneHeight = 60; // ...to y=220

    // Draw meter background (gray) and target zone (green) using PIXI.Graphics chaining style.
    const meterGraphics = new PIXI.Graphics()
        .rect(meterX, meterY, meterWidth, meterHeight)
        .fill(0xcccccc)
        .rect(meterX, targetZoneY, meterWidth, targetZoneHeight)
        .fill(0x00ff00);
    app.stage.addChild(meterGraphics);

    // Create the arrow (a white rectangle) that moves along the meter.
    const arrowHeight = 10;
    const arrow = new PIXI.Graphics()
        .rect(meterX, meterY, meterWidth, arrowHeight)
        .fill(0xffffff);
    app.stage.addChild(arrow);

    let arrowSpeed = 300; // pixels per second
    let arrowDirection = 1; // 1 for down, -1 for up
    let arrowMoving = true;

    // Update arrow position each frame.
    app.ticker.add((delta) => {
        if (!arrowMoving) return;
        // delta is in 1/60th second increments.
        const dt = delta / 60;
        arrow.y += arrowSpeed * arrowDirection * dt;
        if (arrow.y + arrowHeight >= meterY + meterHeight) {
            arrow.y = meterY + meterHeight - arrowHeight;
            arrowDirection = -1;
        } else if (arrow.y <= meterY) {
            arrow.y = meterY;
            arrowDirection = 1;
        }
    });

    // Stop button (assumed to be a DOM element with id "stop")
    const stopButton = document.getElementById("stop");
    stopButton.addEventListener("click", () => {
        if (arrowMoving) {
            arrowMoving = false;
            checkResult();
        }
    });

    function checkResult() {
        // If the arrow is fully inside the target zone, it's a success.
        if (
            arrow.y >= targetZoneY &&
            arrow.y + arrowHeight <= targetZoneY + targetZoneHeight
        ) {
            showResult("SUCCESS!");
        } else {
            showResult("FAIL!");
        }
    }

    function showResult(message) {
        const resultText = new PIXI.Text(message, {
            fill: "#ffffff",
            fontSize: 36,
            fontFamily: "Arial",
        });
        resultText.anchor.set(0.5);
        resultText.x = app.screen.width / 2;
        resultText.y = app.screen.height / 2;
        app.stage.addChild(resultText);
        setTimeout(() => {
            app.stage.removeChild(resultText);
            restartGame();
        }, 2000);
    }

    function restartGame() {
        arrow.y = meterY;
        arrowDirection = 1;
        arrowMoving = true;
    }
}

initMeterGame();
