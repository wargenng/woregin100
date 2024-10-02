import Matter from "matter-js";

const canvasSize = 380;
const wallSize = 10;

let engine, render, runner;

function initSimulation() {
    if (engine) {
        Matter.Engine.clear(engine);
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        render.canvas.remove();
        render.canvas = null;
        render.context = null;
        render.textures = {};
    }

    engine = Matter.Engine.create();

    render = Matter.Render.create({
        element: document.getElementById("interactive"),
        engine: engine,
        options: {
            width: canvasSize,
            height: canvasSize,
            background: "#f1f1ef",
            wireframes: false,
        },
    });

    const walls = [
        Matter.Bodies.rectangle(
            canvasSize / 2,
            -wallSize,
            canvasSize,
            wallSize,
            {
                isStatic: true,
            }
        ),
        Matter.Bodies.rectangle(
            canvasSize / 2,
            canvasSize + wallSize,
            canvasSize,
            wallSize,
            {
                isStatic: true,
            }
        ),
        Matter.Bodies.rectangle(
            -wallSize,
            canvasSize / 2,
            wallSize,
            canvasSize,
            {
                isStatic: true,
            }
        ),
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

    let box = Matter.Bodies.rectangle(190, 150, 150, 150, {
        restitution: 0.8,
        render: { fillStyle: "#e57373" },
    });

    let circle = Matter.Bodies.circle(100, 100, 80, {
        restitution: 0.8,
        render: { fillStyle: "#64b5f6" },
    });

    let triangle = Matter.Bodies.polygon(280, 100, 3, 100, {
        restitution: 0.8,
        render: { fillStyle: "#81c784" },
    });

    Matter.Composite.add(engine.world, [box, circle, triangle, ...walls]);

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false },
        },
    });

    Matter.Composite.add(engine.world, mouseConstraint);

    const mouseBody = Matter.Bodies.circle(0, 0, 10, {
        isStatic: false,
        render: { visible: false },
    });
    Matter.Composite.add(engine.world, mouseBody);

    Matter.Events.on(engine, "beforeUpdate", function () {
        Matter.Body.setPosition(mouseBody, {
            x: mouse.position.x,
            y: mouse.position.y,
        });
    });

    Matter.Render.run(render);
    runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
}

document.getElementById("restart").addEventListener("click", function () {
    initSimulation();
});

initSimulation();
