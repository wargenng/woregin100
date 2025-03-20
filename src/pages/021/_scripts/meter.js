import * as PIXI from "pixi.js";

async function initMeterGame() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: "#f1f1ef",
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    await PIXI.Assets.load("/fonts/ww.ttf");
    document.getElementById("meter").appendChild(app.canvas);

    const meterX = 50;
    const meterY = 40;
    const meterWidth = 50;
    const meterHeight = 300;
    const targetZoneY = meterY + 120;
    const targetZoneHeight = 60;

    const meterGraphics = new PIXI.Graphics()
        .rect(meterX, meterY, meterWidth, meterHeight)
        .fill(0xcccccc)
        .rect(meterX, targetZoneY, meterWidth, targetZoneHeight)
        .fill(0x00ff00);
    app.stage.addChild(meterGraphics);

    const arrowHeight = 10;
    const arrow = new PIXI.Graphics()
        .rect(meterX, meterY, meterWidth, arrowHeight)
        .fill(0xff0000);
    app.stage.addChild(arrow);

    let arrowSpeed = 300;
    let arrowDirection = 1;
    let arrowMoving = true;

    app.ticker.add((delta) => {
        if (!arrowMoving) return;
        const dt = delta.deltaTime / 60;
        arrow.y += arrowSpeed * arrowDirection * dt;
        if (arrow.y + arrowHeight >= meterHeight) {
            arrow.y = meterHeight - arrowHeight;
            arrowDirection = -1;
        } else if (arrow.y <= 0) {
            arrow.y = 0;
            arrowDirection = 1;
        }
    });

    const stopButton = document.getElementById("stop");
    stopButton.addEventListener("click", () => {
        if (arrowMoving) {
            arrowMoving = false;
            checkResult();
        }
    });

    function checkResult() {
        const arrowCenter = arrow.y + arrowHeight / 2;
        if (
            arrowCenter >= targetZoneY - meterY &&
            arrowCenter <= targetZoneY - meterY + targetZoneHeight
        ) {
            showResult("SUCCESS!");
        } else {
            showResult("FAIL!");
        }
    }

    function showResult(message) {
        const resultText = new PIXI.Text({
            text: message,
            style: {
                fill: "#000000",
                fontSize: 36,
                fontFamily: "ww",
            },
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
