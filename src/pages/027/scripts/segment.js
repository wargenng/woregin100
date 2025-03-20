import * as PIXI from "pixi.js";

async function initSegment() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: 0xf1f1ef,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    document.getElementById("segment").innerHTML = "";
    document.getElementById("segment").appendChild(app.canvas);

    const segmentAmount = 16;
    const oddsOfLineOccuring = 0.15;
    console.log(app.screen.width);
    let obj = new PIXI.Graphics();

    app.stage.addChild(obj);

    document.getElementById("shuffle").addEventListener("click", randomize);

    function randomize() {
        obj.clear();
        for (let i = 0; i < segmentAmount + 1; i++) {
            for (let j = 0; j < segmentAmount + 1; j++) {
                if (Math.random() < oddsOfLineOccuring) {
                    obj.moveTo(
                        (j * app.screen.width) / segmentAmount,
                        (i * app.screen.width) / segmentAmount
                    )
                        .lineTo(
                            (j * app.screen.width) / segmentAmount,
                            (j * app.screen.width) / segmentAmount
                        )
                        .stroke({ color: 0x000000, width: 2 });
                }

                if (Math.random() < oddsOfLineOccuring) {
                    obj.moveTo(
                        (i * app.screen.width) / segmentAmount,
                        (j * app.screen.width) / segmentAmount
                    )
                        .lineTo(
                            (j * app.screen.width) / segmentAmount,
                            (j * app.screen.width) / segmentAmount
                        )
                        .stroke({ color: 0x000000, width: 2 });
                }
            }
        }
    }

    randomize();
}

initSegment();
