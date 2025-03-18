import * as PIXI from "pixi.js";

async function initNumberMatrix() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: 0xf1f1ef,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    document.getElementById("severance").innerHTML = "";
    document.getElementById("severance").appendChild(app.canvas);

    const gridContainer = new PIXI.Container();
    app.stage.addChild(gridContainer);

    const rows = 10;
    const cols = 10;
    const cellSize = 40;
    const startX = (app.screen.width - cols * cellSize) / 2;
    const startY = (app.screen.height - rows * cellSize) / 2;

    const cellObjects = [];
    const radius = 100;
    const minSize = 15;
    const maxSize = 36;

    const maxDisplacement = 5;
    const maxSpeed = 0.15;

    function createCell(row, col) {
        const digit = Math.floor(Math.random() * 10).toString();
        const cellText = new PIXI.Text({
            text: digit,
            style: { fill: "#000000", fontSize: minSize, fontFamily: "Arial" },
        });
        cellText.anchor.set(0.5);
        cellText.ox = startX + col * cellSize + cellSize / 2;
        cellText.oy = startY + row * cellSize + cellSize / 2;
        cellText.x = cellText.ox;
        cellText.y = cellText.oy;

        cellText.vx = (Math.random() * 2 - 1) * maxSpeed;
        cellText.vy = (Math.random() * 2 - 1) * maxSpeed;
        cellText.locked = false;
        cellText.interactive = true;
        cellText.buttonMode = true;
        cellText.on("pointerdown", () => {
            cellText.locked = !cellText.locked;
            if (cellText.locked) {
                cellText.style.fontSize = maxSize;
            } else {
                cellText.style.fontSize = minSize;
            }
        });

        gridContainer.addChild(cellText);
        cellObjects.push(cellText);
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            createCell(r, c);
        }
    }

    app.stage.interactive = true;
    app.stage.on("pointermove", (event) => {
        const mousePos = event.data.global;
        for (const cell of cellObjects) {
            if (cell.locked) continue;
            const dx = mousePos.x - cell.x;
            const dy = mousePos.y - cell.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius) {
                const ratio = 1 - dist / radius;
                const newSize = minSize + ratio * (maxSize - minSize);
                cell.style.fontSize = newSize;
            } else {
                cell.style.fontSize = minSize;
            }
        }
    });

    app.ticker.add(() => {
        for (const cell of cellObjects) {
            if (cell.locked) continue;

            cell.x += cell.vx;
            cell.y += cell.vy;

            const dx = cell.x - cell.ox;
            const dy = cell.y - cell.oy;
            const distSq = dx * dx + dy * dy;

            if (distSq > maxDisplacement * maxDisplacement) {
                cell.x -= cell.vx;
                cell.y -= cell.vy;
                cell.vx = -cell.vx;
                cell.vy = -cell.vy;
            }
        }
    });
}

initNumberMatrix();
