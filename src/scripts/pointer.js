import Matter from "matter-js";

const canvasSize = 380;
const gridSize = 10;
const spacing = canvasSize / gridSize;

const engine = Matter.Engine.create();

const render = Matter.Render.create({
    element: document.getElementById("pointer"),
    engine: engine,
    options: {
        width: canvasSize,
        height: canvasSize,
        background: "#f1f1ef",
        wireframes: false,
        pixelRatio: "auto",
    },
});

const vertices = [
    { x: 0, y: -10 },
    { x: -10, y: 10 },
    { x: 10, y: 10 },
];

const triangles = [];
for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        const triangle = Matter.Bodies.fromVertices(x, y, [vertices], {
            render: { fillStyle: "#000000" },
            isStatic: true,
        });
        triangles.push(triangle);
    }
}

Matter.Composite.add(engine.world, triangles);

Matter.Render.run(render);

const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

const updateTriangles = (x, y) => {
    triangles.forEach((triangle) => {
        const angle = Math.atan2(
            y - triangle.position.y,
            x - triangle.position.x
        );
        Matter.Body.setAngle(triangle, angle + Math.PI / 2);
    });
};

document.addEventListener("mousemove", (event) => {
    const mouseX = event.clientX - render.canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - render.canvas.getBoundingClientRect().top;
    updateTriangles(mouseX, mouseY);
});

document.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    const touchX = touch.clientX - render.canvas.getBoundingClientRect().left;
    const touchY = touch.clientY - render.canvas.getBoundingClientRect().top;
    updateTriangles(touchX, touchY);
});
