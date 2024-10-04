import paper from "paper";

const canvas = document.getElementById("waves");
paper.setup(canvas);

let mousePos = paper.view.center.multiply(0.5);
let pathHeight = mousePos.y;
const points = 5;
const path = new paper.Path({
    fillColor: "black",
});

initializeBlob();

function initializeBlob() {
    const { center, size } = paper.view;
    const radius = Math.min(size.width, size.height) / 2;

    path.removeSegments();

    for (let i = 0; i < points; i++) {
        const point = calculateBlobPoint(center, radius, i, points);
        path.add(new paper.Point(point.x, point.y));
    }

    path.closed = true;
}

function calculateBlobPoint(center, radius, index, totalPoints) {
    const angle = (index / totalPoints) * Math.PI * 2;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;

    return { x, y };
}

function updateBlobPoints(event) {
    const { center, size } = paper.view;
    const widthFactor = size.width / 3;
    pathHeight += (center.y - mousePos.y - pathHeight) / 10;

    for (let i = 0; i < points; i++) {
        const segment = path.segments[i];
        const sinSeed = event.count + (i + (i % 10)) * 100;
        const sinHeight = (Math.sin(sinSeed / 200) * pathHeight) / 2;

        const { x: baseX, y: baseY } = calculateBlobPoint(
            center,
            widthFactor,
            i,
            points
        );
        segment.point.x = baseX + Math.sin(sinSeed / 100) * sinHeight;
        segment.point.y = baseY + Math.sin(sinSeed / 100) * sinHeight;
    }

    path.smooth({ type: "continuous" });
}

paper.view.onFrame = (event) => {
    updateBlobPoints(event);
};

paper.view.onMouseMove = (event) => {
    mousePos = event.point;
};

paper.view.onResize = () => {
    initializeBlob();
};
