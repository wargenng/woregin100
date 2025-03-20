import paper from "paper";

const canvas = document.getElementById("swirl");

paper.setup(canvas);

const center = paper.view.center;
const radius = 150;
const minRadius = 50; // Minimum distance from the center

const circlePath = new paper.Path.Circle(center, 25);
circlePath.strokeColor = "black";

const clones = 50;
const angle = 360 / clones;
const circles = [];

for (let i = 0; i < clones; i++) {
    const clonedPath = circlePath.clone();
    const offset = new paper.Point({
        length: radius,
        angle: angle * i,
    });
    clonedPath.position = center.add(offset);
    circles.push({
        path: clonedPath,
        angle: angle * i,
    });
}

circlePath.remove();

const speed = 0.5;
const rotationSpeed = 0.5;

paper.view.onFrame = function (event) {
    const currentRadius =
        minRadius +
        (radius - minRadius) * Math.abs(Math.sin(event.time * speed));

    circles.forEach((circle) => {
        const rotation =
            circle.angle + (event.time * rotationSpeed * 360) / clones;
        const offset = new paper.Point({
            length: currentRadius,
            angle: rotation,
        });
        circle.path.position = center.add(offset);
    });
};
