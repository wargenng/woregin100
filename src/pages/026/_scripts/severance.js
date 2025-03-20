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

    const deleteButton = document.getElementById("delete");

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

        cellText.selected = false;
        cellText.deletingPhase = 0;

        cellText.interactive = true;
        cellText.buttonMode = true;
        cellText.on("pointerdown", () => {
            cellText.selected = !cellText.selected;
            cellText.style.fontSize = cellText.selected ? maxSize : minSize;
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
            if (cell.deletingPhase !== 0 || cell.selected) continue;
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
            if (cell.deletingPhase === 0 && !cell.selected) {
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
            } else if (cell.deletingPhase === 2) {
                cell.x += cell.vx;
                cell.y += cell.vy;
            }
        }

        for (let i = cellObjects.length - 1; i >= 0; i--) {
            const cell = cellObjects[i];
            if (cell.deletingPhase === 2) {
                if (cell.x < -50 || cell.y > app.screen.height + 50) {
                    gridContainer.removeChild(cell);
                    cellObjects.splice(i, 1);
                }
            }
        }
    });

    deleteButton.addEventListener("click", () => {
        for (const cell of cellObjects) {
            if (cell.selected && cell.deletingPhase === 0) {
                cell.deletingPhase = 2;
                cell.vx = -(4 + Math.random() * 4);
                cell.vy = 4 + Math.random() * 4;
            }
        }
    });
}

initNumberMatrix();
