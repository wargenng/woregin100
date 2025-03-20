import paper from "paper";

const canvas = document.getElementById("follow");
paper.setup(canvas);

const circles = [];
const numCircles = 4;
let targetPosition = paper.view.center;

for (let i = 0; i < numCircles; i++) {
    const circle = new paper.Path.Circle(targetPosition, 10 / (i + 1));
    circle.fillColor = "#f1f1ef";
    circle.strokeColor = "black";
    circles.push(circle);
    circle.bringToFront();
}

circles.reverse().forEach((circle) => {
    circle.bringToFront();
});
circles.reverse();

paper.view.onMouseMove = (event) => {
    targetPosition = event.point;
};

paper.view.onFrame = () => {
    let previousPosition = targetPosition;
    const smoothing = 0.1;

    circles.forEach((circle) => {
        const vector = previousPosition.subtract(circle.position);
        circle.position = circle.position.add(vector.multiply(smoothing));
        previousPosition = circle.position;
    });
};
