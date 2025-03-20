import Matter from "matter-js";

const canvasSize = 380;
const wallSize = 10;

const engine = Matter.Engine.create();

const render = Matter.Render.create({
    element: document.getElementById("shapes"),
    engine: engine,
    options: {
        width: canvasSize,
        height: canvasSize,
        background: "#f1f1ef",
        wireframes: false,
        pixelRatio: "auto",
    },
});

const getRandomBrightPastelColor = () => {
    const r = Math.floor(Math.random() * 156) + 100;
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r},${g},${b})`;
};

const createInitialBox = () => {
    return Matter.Bodies.rectangle(190, 150, 60, 60, {
        restitution: 0.8,
        render: { fillStyle: getRandomBrightPastelColor() },
    });
};

const walls = [
    Matter.Bodies.rectangle(canvasSize / 2, -wallSize, canvasSize, wallSize, {
        isStatic: true,
    }),
    Matter.Bodies.rectangle(
        canvasSize / 2,
        canvasSize + wallSize,
        canvasSize,
        wallSize,
        {
            isStatic: true,
        }
    ),
    Matter.Bodies.rectangle(-wallSize, canvasSize / 2, wallSize, canvasSize, {
        isStatic: true,
    }),
    Matter.Bodies.rectangle(
        canvasSize + wallSize,
        canvasSize / 2,
        wallSize,
        canvasSize,
        {
            isStatic: true,
        }
    ),
];

// Initial box
let box = createInitialBox();
Matter.Composite.add(engine.world, [box, ...walls]);

Matter.Render.run(render);

const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

const spawnShape = () => {
    const shapeType = Math.floor(Math.random() * 3);
    const x = Math.random() * 360 + 10;
    const y = Math.random() * 80 + 10;
    const restitutionValue = 0.8;
    const color = getRandomBrightPastelColor();
    let newShape;

    switch (shapeType) {
        case 0:
            newShape = Matter.Bodies.circle(
                x,
                y,
                Math.floor(Math.random() * 20) + 20,
                {
                    restitution: restitutionValue,
                    render: { fillStyle: color },
                }
            );
            break;
        case 1:
            const random = Math.floor(Math.random() * 80);
            newShape = Matter.Bodies.rectangle(x, y, random + 20, random + 20, {
                restitution: restitutionValue,
                render: { fillStyle: color },
            });
            break;
        case 2:
            const starRadius = Math.floor(Math.random() * 20) + 20;
            const starVertices = Array.from({ length: 10 }, (_, i) => {
                const angle = (i * Math.PI) / 5;
                const radius = i % 2 === 0 ? starRadius : starRadius / 2;
                return {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                };
            });
            newShape = Matter.Bodies.fromVertices(x, y, starVertices, {
                restitution: restitutionValue,
                render: { fillStyle: color },
            });
            break;
    }

    Matter.Composite.add(engine.world, newShape);
};

const restart = () => {
    Matter.Composite.clear(engine.world, false);
    box = createInitialBox();
    Matter.Composite.add(engine.world, [box, ...walls]);
};

document.getElementById("add").addEventListener("click", spawnShape);
document.getElementById("restart").addEventListener("click", restart);
