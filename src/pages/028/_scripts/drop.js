import Matter from "matter-js";

const canvasSize = 380;
const wallSize = 10;
const MAX_BALLS = 50;
const CONTAINER_SPEED = 2;
const CONTAINER_WIDTH = 100;
const CONTAINER_HEIGHT = 100;
const CONTAINER_WALL_THICKNESS = 5;
const CONTAINER_GAP = 60;
const CONTAINER_Y = canvasSize - 80;
const BALL_RADIUS = 10;
const TUBE_WIDTH = 40;
const TUBE_HEIGHT = 80;
const BALL_SPAWN_Y = 50;
const TUBE_TOP_Y = 20;
const BUTTON_WIDTH = 80;
const BUTTON_HEIGHT = 40;
const BUTTON_Y = canvasSize - BUTTON_HEIGHT - 20;

let engine, render, runner;
let ballsRemaining = MAX_BALLS;
let score = 0;
let containers = [];
let scoredBalls = new Set();
let tubeBall = null;
let nextBallColor = null;
let gameStarted = false;
let gameOver = false;
let timeRemaining = 20;
let timerInterval = null;
let bestScore = parseInt(localStorage.getItem("dropGameBestScore")) || 0;

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

function createTube() {
    const leftWall = Matter.Bodies.rectangle(
        canvasSize / 2 - TUBE_WIDTH / 2,
        TUBE_TOP_Y + TUBE_HEIGHT / 2,
        wallSize,
        TUBE_HEIGHT + wallSize,
        {
            isStatic: true,
            render: { fillStyle: "#666666" },
            collisionFilter: {
                group: 3,
            },
        }
    );

    const rightWall = Matter.Bodies.rectangle(
        canvasSize / 2 + TUBE_WIDTH / 2,
        TUBE_TOP_Y + TUBE_HEIGHT / 2,
        wallSize,
        TUBE_HEIGHT + wallSize,
        {
            isStatic: true,
            render: { fillStyle: "#666666" },
            collisionFilter: {
                group: 3,
            },
        }
    );

    const topWall = Matter.Bodies.rectangle(
        canvasSize / 2,
        TUBE_TOP_Y,
        TUBE_WIDTH + wallSize,
        wallSize,
        {
            isStatic: true,
            render: { fillStyle: "#666666" },
            collisionFilter: {
                group: 3,
            },
        }
    );

    return Matter.Body.create({
        parts: [leftWall, rightWall, topWall],
        isStatic: true,
        collisionFilter: {
            group: 3,
        },
    });
}

function createTubeBall() {
    if (tubeBall) {
        Matter.Composite.remove(engine.world, tubeBall);
    }

    const color = "#ff0000";
    nextBallColor = color;

    tubeBall = Matter.Bodies.circle(canvasSize / 2, BALL_SPAWN_Y, BALL_RADIUS, {
        isStatic: true,
        render: { fillStyle: color },
        collisionFilter: {
            group: 4,
        },
    });

    Matter.Composite.add(engine.world, tubeBall);
}

function createContainer(x) {
    const bottom = Matter.Bodies.rectangle(
        x,
        CONTAINER_Y + CONTAINER_WALL_THICKNESS / 2,
        CONTAINER_WIDTH,
        CONTAINER_WALL_THICKNESS,
        {
            isStatic: true,
            render: { fillStyle: "#e0e0e0" },
            collisionFilter: {
                group: 1,
            },
        }
    );

    const leftWall = Matter.Bodies.rectangle(
        x - CONTAINER_WIDTH / 2 + CONTAINER_WALL_THICKNESS / 2,
        CONTAINER_Y - CONTAINER_HEIGHT / 2,
        CONTAINER_WALL_THICKNESS,
        CONTAINER_HEIGHT,
        {
            isStatic: true,
            render: { fillStyle: "#e0e0e0" },
            collisionFilter: {
                group: 1,
            },
        }
    );

    const rightWall = Matter.Bodies.rectangle(
        x + CONTAINER_WIDTH / 2 - CONTAINER_WALL_THICKNESS / 2,
        CONTAINER_Y - CONTAINER_HEIGHT / 2,
        CONTAINER_WALL_THICKNESS,
        CONTAINER_HEIGHT,
        {
            isStatic: true,
            render: { fillStyle: "#e0e0e0" },
            collisionFilter: {
                group: 1,
            },
        }
    );

    const scoringLine = Matter.Bodies.rectangle(
        x,
        CONTAINER_Y - CONTAINER_HEIGHT * 0.75,
        CONTAINER_WIDTH - CONTAINER_WALL_THICKNESS,
        2,
        {
            isStatic: true,
            isSensor: true,
            render: { fillStyle: "rgba(255, 0, 0, 0.0)" },
            collisionFilter: {
                group: 6,
            },
        }
    );

    return Matter.Body.create({
        parts: [bottom, leftWall, rightWall, scoringLine],
        isStatic: true,
        collisionFilter: {
            group: 1,
        },
    });
}

function createBall(color) {
    return Matter.Bodies.circle(canvasSize / 2, 50, BALL_RADIUS, {
        restitution: 0.8,
        friction: 0.1,
        density: 0.001,
        render: { fillStyle: "#ff0000" },
        collisionFilter: {
            group: 2,
        },
    });
}

function updateBallCounter() {
    const counter = document.getElementById("ball-counter");
    if (counter) {
        counter.textContent = `Balls: ${ballsRemaining}`;
    }
}

function updateScore() {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    }
}

function updateTimer() {
    const timerElement = document.getElementById("timer");
    const backgroundTimer = document.getElementById("background-timer");

    if (timerElement) {
        timerElement.textContent = `Time: ${timeRemaining}`;
    }

    if (backgroundTimer) {
        if (timeRemaining <= 10) {
            backgroundTimer.textContent = timeRemaining;
            backgroundTimer.classList.remove("hidden");
        } else {
            backgroundTimer.classList.add("hidden");
        }
    }
}

function handleCollision(event) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (
            (pair.bodyA.collisionFilter.group === 6 &&
                pair.bodyB.collisionFilter.group === 2) ||
            (pair.bodyA.collisionFilter.group === 2 &&
                pair.bodyB.collisionFilter.group === 6)
        ) {
            const ball =
                pair.bodyA.collisionFilter.group === 2
                    ? pair.bodyA
                    : pair.bodyB;

            if (!scoredBalls.has(ball.id)) {
                score++;
                scoredBalls.add(ball.id);
                updateScore();
            }
        }
    }
}

function handleDrop() {
    if (!gameStarted || gameOver) return;

    if (ballsRemaining > 0 && tubeBall) {
        const ball = createBall(nextBallColor);
        Matter.Composite.add(engine.world, ball);
        ballsRemaining--;
        updateBallCounter();

        createTubeBall();

        if (score === MAX_BALLS) {
            endGame(true);
        }
    }
}

function startTimer() {
    timeRemaining = 20;
    updateTimer();

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    const backgroundTimer = document.getElementById("background-timer");
    if (backgroundTimer) {
        backgroundTimer.classList.add("hidden");
    }

    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimer();
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

function updateBestScore() {
    const bestScoreElement = document.getElementById("best-score");
    if (bestScoreElement) {
        bestScoreElement.textContent = bestScore;
    }
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    timeRemaining = 20;
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("end-screen").classList.add("hidden");
    const backgroundTimer = document.getElementById("background-timer");
    if (backgroundTimer) {
        backgroundTimer.classList.add("hidden");
    }
    initSimulation();
    startTimer();
    updateBestScore();
}

function endGame(isWin) {
    gameOver = true;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const finalScoreElement = document.getElementById("final-score");
    const endMessageElement = document.getElementById("end-message");
    const endScreenElement = document.getElementById("end-screen");

    if (finalScoreElement) {
        finalScoreElement.textContent = score;
    }

    if (endMessageElement) {
        if (score === MAX_BALLS) {
            endMessageElement.textContent =
                "🎉 PERFECT SCORE! You scored all 50 balls! 🎉";
        } else if (isWin) {
            endMessageElement.textContent =
                "Congratulations! You scored all 50 balls!";
        } else {
            endMessageElement.textContent = `Time's up! You scored ${score} out of 50 balls.`;
        }
    }

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("dropGameBestScore", bestScore);
    }
    updateBestScore();

    if (endScreenElement) {
        endScreenElement.classList.remove("hidden");
    }
}

function updateContainers() {
    containers.forEach((container) => {
        Matter.Body.translate(container, { x: CONTAINER_SPEED, y: 0 });
    });

    const lastContainer = containers[containers.length - 1];
    if (!lastContainer || lastContainer.position.x > CONTAINER_GAP) {
        const newContainer = createContainer(-CONTAINER_WIDTH);
        containers.push(newContainer);
        Matter.Composite.add(engine.world, newContainer);
    }

    while (
        containers.length > 0 &&
        containers[0].position.x > canvasSize + CONTAINER_WIDTH
    ) {
        Matter.Composite.remove(engine.world, containers[0]);
        containers.shift();
    }
}

function initSimulation() {
    if (engine) {
        Matter.Engine.clear(engine);
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        render.canvas.remove();
    }

    ballsRemaining = MAX_BALLS;
    score = 0;
    scoredBalls.clear();
    containers = [];
    tubeBall = null;
    nextBallColor = null;
    updateBallCounter();
    updateScore();
    updateTimer();

    engine = Matter.Engine.create();
    render = Matter.Render.create({
        element: document.getElementById("drop"),
        engine: engine,
        options: {
            width: canvasSize,
            height: canvasSize,
            background: "#f1f1ef",
            wireframes: false,
            pixelRatio: "auto",
        },
    });

    render.canvas.addEventListener("click", handleDrop);

    const tube = createTube();
    const walls = createWalls();

    const initialContainer = createContainer(-CONTAINER_WIDTH);
    containers.push(initialContainer);

    Matter.Composite.add(engine.world, [walls, tube, initialContainer]);

    createTubeBall();

    Matter.Events.on(engine, "collisionStart", handleCollision);

    Matter.Render.run(render);
    runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    Matter.Events.on(engine, "beforeUpdate", updateContainers);
}

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("start-button")
        .addEventListener("click", startGame);
    document
        .getElementById("restart-button")
        .addEventListener("click", startGame);
    document.getElementById("restart").addEventListener("click", startGame);

    initSimulation();
    document.getElementById("start-screen").classList.remove("hidden");
    updateBestScore();
});
