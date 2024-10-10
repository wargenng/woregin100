import paper from "paper";

const STROKE_COLOR = "black";
const STROKE_WIDTH = 2;
const SHADOW_FILL_COLOR = new paper.Color(0, 0, 0, 0.3);

const dpr = window.devicePixelRatio || 1;
const canvas = document.getElementById("picture");
canvas.width = 380;
canvas.height = 380;

paper.setup(canvas);
const points = 5;

const imageUrls = [
    "https://images.unsplash.com/photo-1571566882372-1598d88abd90?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1568615944078-821ced977caa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGNhdHxlbnwwfDF8MHx8fDI%3D",
    "https://images.unsplash.com/photo-1518288774672-b94e808873ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2F0fGVufDB8MXwwfHx8Mg%3D%3D",
    "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNhdHxlbnwwfDF8MHx8fDI%3D",
    "https://images.unsplash.com/photo-1516374348294-ce51573b0fb5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNhdHxlbnwwfDF8MHx8fDI%3D",
    "https://images.unsplash.com/photo-1557948206-7478d769f813?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGNhdHxlbnwwfDF8MHx8fDI%3D",
    "https://images.unsplash.com/photo-1531040630173-7cfb894c8eaa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fGNhdHxlbnwwfDF8MHx8fDI%3D",
];

let currentImageIndex = Math.round(Math.random(0, 1) * imageUrls.length) - 1;
const images = [];
let imagesLoaded = 0;

// Load all images
imageUrls.forEach((url) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === imageUrls.length) {
            startAnimation();
        }
    };
    img.src = url;
    images.push(img);
});

let animationPhase = null;
let phaseTime = 0;
let blobScale = 0;

function startAnimation() {
    const clipPath = new paper.Path();
    const strokePath = new paper.Path({
        strokeColor: STROKE_COLOR,
        strokeWidth: STROKE_WIDTH,
    });

    const shadowPath = new paper.Path({
        fillColor: SHADOW_FILL_COLOR,
    });

    initializeBlob(clipPath, strokePath, shadowPath);

    const img = images[currentImageIndex];
    const raster = new paper.Raster(img);

    const newWidth = canvas.width / dpr;
    const newHeight = ((canvas.width / dpr) * img.height) / img.width;
    raster.size = new paper.Size(newWidth, newHeight);

    raster.position = paper.view.center;
    raster.visible = true;

    const shadowGroup = new paper.Group([shadowPath]);
    const mainGroup = new paper.Group([clipPath, raster, strokePath]);
    mainGroup.clipped = true;

    const blobGroup = new paper.Group([shadowGroup, mainGroup]);

    animationPhase = "intro";
    phaseTime = 0;

    clipPath.visible = true;
    strokePath.visible = true;
    shadowPath.visible = true;

    blobGroup.onMouseDown = () => {
        if (!animationPhase) {
            animationPhase = "shrinking";
            phaseTime = 0;
        }
    };

    paper.view.onFrame = (event) => {
        handleAnimation(event, raster, clipPath, strokePath);
        updateBlobPoints(event, clipPath, strokePath, shadowPath);
    };

    paper.view.onResize = () => {
        initializeBlob(clipPath, strokePath, shadowPath);
        raster.position = paper.view.center;

        const img = images[currentImageIndex];
        const newWidth = canvas.width / dpr;
        const newHeight = ((canvas.width / dpr) * img.height) / img.width;
        raster.size = new paper.Size(newWidth, newHeight);
    };
}

function initializeBlob(clipPath, strokePath, shadowPath) {
    const { center, size } = paper.view;
    const radius = Math.min(size.width, size.height) / 2;

    clipPath.removeSegments();
    strokePath.removeSegments();
    shadowPath.removeSegments();

    const shadowOffset = new paper.Point(10, 10);

    for (let i = 0; i < points; i++) {
        const point = calculateBlobPoint(center, radius, i, points);
        clipPath.add(new paper.Point(point));
        strokePath.add(new paper.Point(point));

        const shadowPoint = {
            x: point.x + shadowOffset.x,
            y: point.y + shadowOffset.y,
        };
        shadowPath.add(new paper.Point(shadowPoint));
    }

    clipPath.closed = true;
    strokePath.closed = true;
    shadowPath.closed = true;

    clipPath.visible = false;
    strokePath.visible = false;
    shadowPath.visible = false;
}

function calculateBlobPoint(center, radius, index, totalPoints) {
    const angle = (index / totalPoints) * Math.PI * 2;
    return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
    };
}

function easeInBack(t) {
    const c1 = 1.70158;
    return t * t * ((c1 + 1) * t - c1);
}

function easeOutBack(t) {
    const c1 = 1.70158;
    return 1 + --t * t * ((c1 + 1) * t + c1);
}

function handleAnimation(event, raster, clipPath, strokePath) {
    const duration = 0.5;
    if (animationPhase === "intro") {
        phaseTime += event.delta;
        let progress = Math.min(phaseTime / duration, 1);
        blobScale = easeOutBack(progress);
        if (progress >= 1) {
            animationPhase = null;
            blobScale = 1;
        }
    } else if (animationPhase === "shrinking") {
        phaseTime += event.delta;
        let progress = Math.min(phaseTime / duration, 1);
        blobScale = 1 - easeInBack(progress);
        if (progress >= 1) {
            animationPhase = "holding";
            phaseTime = 0;
            blobScale = 0;

            currentImageIndex = (currentImageIndex + 1) % images.length;

            const img = images[currentImageIndex];
            raster.image = img;
            const newWidth = canvas.width / dpr;
            const newHeight = ((canvas.width / dpr) * img.height) / img.width;
            raster.size = new paper.Size(newWidth, newHeight);
            raster.position = paper.view.center;
        }
    } else if (animationPhase === "holding") {
        phaseTime += event.delta;
        if (phaseTime >= 0.5) {
            animationPhase = "expanding";
            phaseTime = 0;
        }
    } else if (animationPhase === "expanding") {
        phaseTime += event.delta;
        let progress = Math.min(phaseTime / duration, 1);
        blobScale = easeOutBack(progress);
        if (progress >= 1) {
            animationPhase = "settling";
            phaseTime = 0;
        }
    } else if (animationPhase === "settling") {
        phaseTime += event.delta;
        let progress = Math.min(phaseTime / duration, 1);
        blobScale = 1 + (blobScale - 1) * (1 - progress);
        if (progress >= 1) {
            animationPhase = null;
            blobScale = 1;
        }
    }
}

function updateBlobPoints(event, clipPath, strokePath, shadowPath) {
    const { center, size } = paper.view;
    const baseRadius = size.width / 2.4;
    const radius = baseRadius * blobScale;
    const mousePos = paper.view.center.multiply(0.5);
    let pathHeight = mousePos.y;

    pathHeight += (center.y - mousePos.y - pathHeight) / 10;

    const amplitudeFactor = 0.5;
    const shadowOffset = new paper.Point(10, 10);

    for (let i = 0; i < points; i++) {
        const sinSeed = event.count + (i + (i % 10)) * 100;
        const sinHeight = (Math.sin(sinSeed / 200) * pathHeight) / 6;
        const offset =
            Math.sin(sinSeed / 100) * sinHeight * blobScale * amplitudeFactor;

        const basePoint = calculateBlobPoint(center, radius, i, points);
        const newX = basePoint.x + offset;
        const newY = basePoint.y + offset;

        clipPath.segments[i].point.set(newX, newY);
        strokePath.segments[i].point.set(newX, newY);
        shadowPath.segments[i].point.set(
            newX + shadowOffset.x,
            newY + shadowOffset.y
        );
    }

    clipPath.smooth({ type: "continuous" });
    strokePath.smooth({ type: "continuous" });
    shadowPath.smooth({ type: "continuous" });
}
