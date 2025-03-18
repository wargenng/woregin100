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

    function createCell(row, col) {
        const digit = Math.floor(Math.random() * 10).toString();
        const cellText = new PIXI.Text({
            text: digit,
            style: { fill: "#000000", fontSize: 15, fontFamily: "Arial" },
        });
        cellText.anchor.set(0.5);
        cellText.ox = startX + col * cellSize + cellSize / 2; // Original X
        cellText.oy = startY + row * cellSize + cellSize / 2; // Original Y
        cellText.x = cellText.ox;
        cellText.y = cellText.oy;

        // Random velocity in x, y
        const maxSpeed = 0.5;
        cellText.vx = (Math.random() * 2 - 1) * maxSpeed;
        cellText.vy = (Math.random() * 2 - 1) * maxSpeed;
        gridContainer.addChild(cellText);
        cellObjects.push(cellText);
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            createCell(r, c);
        }
    }

    const radius = 100;
    const minSize = 15;
    const maxSize = 36;

    app.stage.interactive = true;
    app.stage.on("pointermove", (event) => {
        const mousePos = event.data.global;
        for (const cell of cellObjects) {
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
            cell.x += cell.vx;
            cell.y += cell.vy;

            // maxDisplacement = how far from (ox, oy) we allow
            const maxDisplacement = 5;
            const dx = cell.x - cell.ox;
            const dy = cell.y - cell.oy;
            const distSq = dx * dx + dy * dy;

            // If cell goes too far from original spot, reverse or randomize velocity
            if (distSq > maxDisplacement * maxDisplacement) {
                cell.x -= cell.vx;
                cell.y -= cell.vy;
                // Reverse velocity or randomize it
                cell.vx = -cell.vx * (0.5 + Math.random() * 0.5);
                cell.vy = -cell.vy * (0.5 + Math.random() * 0.5);
            }
        }
    });
}

initNumberMatrix();
