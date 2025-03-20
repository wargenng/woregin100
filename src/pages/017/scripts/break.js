import Matter from "matter-js";

const canvasSize = 380;
const wallSize = 10;
let engine, render, runner;

const getRandomBrightPastelColor = () => {
    const r = Math.floor(Math.random() * 156) + 100;
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r},${g},${b})`;
};

function createWalls() {
    return [
        Matter.Bodies.rectangle(
            canvasSize / 2,
            -wallSize,
            canvasSize,
            wallSize,
            { isStatic: true }
        ),
        Matter.Bodies.rectangle(
            canvasSize / 2,
            canvasSize + wallSize,
            canvasSize,
            wallSize,
            { isStatic: true }
        ),
        Matter.Bodies.rectangle(
            -wallSize,
            canvasSize / 2,
            wallSize,
            canvasSize,
            { isStatic: true }
        ),
        Matter.Bodies.rectangle(
            canvasSize + wallSize,
            canvasSize / 2,
            wallSize,
            canvasSize,
            { isStatic: true }
        ),
    ];
}

function createInitialBox() {
    return Matter.Bodies.rectangle(canvasSize / 2, canvasSize / 2, 250, 250, {
        restitution: 0.8,
        render: { fillStyle: "#000000" },
        isStatic: true,
    });
}

function splitBox(body) {
    const boxSize = body.bounds.max.x - body.bounds.min.x;
    const newBoxSize = boxSize / 2;
    const offset = newBoxSize / 2;
    const velocityMagnitude = 10;

    const newBoxes = [
        Matter.Bodies.rectangle(
            body.position.x - offset,
            body.position.y - offset,
            newBoxSize,
            newBoxSize,
            {
                restitution: 0.8,
                render: { fillStyle: getRandomBrightPastelColor() },
            }
        ),
        Matter.Bodies.rectangle(
            body.position.x + offset,
            body.position.y - offset,
            newBoxSize,
            newBoxSize,
            {
                restitution: 0.8,
                render: { fillStyle: getRandomBrightPastelColor() },
            }
        ),
        Matter.Bodies.rectangle(
            body.position.x - offset,
            body.position.y + offset,
            newBoxSize,
            newBoxSize,
            {
                restitution: 0.8,
                render: { fillStyle: getRandomBrightPastelColor() },
            }
        ),
        Matter.Bodies.rectangle(
            body.position.x + offset,
            body.position.y + offset,
            newBoxSize,
            newBoxSize,
            {
                restitution: 0.8,
                render: { fillStyle: getRandomBrightPastelColor() },
            }
        ),
    ];

    Matter.Body.setVelocity(newBoxes[0], {
        x: -velocityMagnitude,
        y: -velocityMagnitude,
    });
    Matter.Body.setVelocity(newBoxes[1], {
        x: velocityMagnitude,
        y: -velocityMagnitude,
    });
    Matter.Body.setVelocity(newBoxes[2], {
        x: -velocityMagnitude,
        y: velocityMagnitude,
    });
    Matter.Body.setVelocity(newBoxes[3], {
        x: velocityMagnitude,
        y: velocityMagnitude,
    });

    Matter.Composite.add(engine.world, newBoxes);
}

function handleClick(event) {
    const mouse = Matter.Vector.create(event.offsetX, event.offsetY);
    Matter.Composite.allBodies(engine.world).forEach((body) => {
        if (Matter.Bounds.contains(body.bounds, mouse)) {
            Matter.Composite.remove(engine.world, body);
            splitBox(body);
        }
    });
}

function initSimulation() {
    if (engine) {
        Matter.Engine.clear(engine);
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        render.canvas.remove();
    }

    engine = Matter.Engine.create();
    render = Matter.Render.create({
        element: document.getElementById("break"),
        engine: engine,
        options: {
            width: canvasSize,
            height: canvasSize,
            background: "#f1f1ef",
            wireframes: false,
            pixelRatio: "auto",
        },
    });

    const walls = createWalls();
    const initialBox = createInitialBox();

    Matter.Composite.add(engine.world, [initialBox, ...walls]);

    Matter.Render.run(render);
    runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    render.canvas.addEventListener("click", handleClick);
}

document.getElementById("restart").addEventListener("click", initSimulation);

initSimulation();
