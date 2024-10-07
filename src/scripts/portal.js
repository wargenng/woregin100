import Matter from "matter-js";

const canvasSize = 380;
const wallSize = 20;

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
        element: document.getElementById("portal"),
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
            -wallSize / 2,
            canvasSize * 2,
            wallSize,
            {
                isStatic: true,
            }
        ),
        Matter.Bodies.rectangle(
            canvasSize / 2,
            canvasSize + wallSize / 2,
            canvasSize * 2,
            wallSize,
            {
                isStatic: true,
            }
        ),
    ];

    let box = Matter.Bodies.rectangle(190, 100, 100, 100, {
        restitution: 0.8,
        render: { fillStyle: "black" },
    });

    Matter.Composite.add(engine.world, [box, ...walls]);

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false },
        },
    });

    Matter.Composite.add(engine.world, mouseConstraint);

    // portal effect
    Matter.Events.on(engine, "beforeUpdate", function () {
        const boxWidth = box.bounds.max.x - box.bounds.min.x;

        if (box.position.x - boxWidth / 2 > canvasSize) {
            // box is off the right edge, wrap to left
            let newPosition = { x: -boxWidth / 2, y: box.position.y };
            let delta = Matter.Vector.sub(newPosition, box.position);
            Matter.Body.translate(box, delta);
        } else if (box.position.x + boxWidth / 2 < 0) {
            // box is off the left edge, wrap to right
            let newPosition = {
                x: canvasSize + boxWidth / 2,
                y: box.position.y,
            };
            let delta = Matter.Vector.sub(newPosition, box.position);
            Matter.Body.translate(box, delta);
        }
    });

    Matter.Render.run(render);
    runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
}

document.getElementById("restart").addEventListener("click", function () {
    initSimulation();
});

initSimulation();
