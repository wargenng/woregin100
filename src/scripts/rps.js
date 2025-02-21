import * as PIXI from "pixi.js";

async function initSimulation() {
    const app = new PIXI.Application();
    await app.init({
        backgroundColor: "#f1f1ef",
        width: 380,
        height: 380,
    });
    document.getElementById("rps").appendChild(app.canvas);

    let wins = 0;
    let losses = 0;
    let draws = 0;

    const scoreboardText = new PIXI.Text({
        text: "Win: 0  Loss: 0  Draw: 0",
        style: {
            fill: "#000000",
            fontSize: 16,
        },
    });
    scoreboardText.anchor.set(0.5, 0);
    scoreboardText.x = app.screen.width * 0.5;
    scoreboardText.y = app.screen.height - 30;
    app.stage.addChild(scoreboardText);

    const choices = ["rock", "paper", "scissors"];
    const emojis = {
        rock: "✊",
        paper: "✋",
        scissors: "✌️",
    };
    const choiceTexts = {};

    function createChoice(choice, xRatio, yRatio) {
        const style = new PIXI.TextStyle({
            fill: "#ffffff",
            fontSize: 36,
        });
        const text = new PIXI.Text({ text: emojis[choice], style: style });
        text.anchor.set(0.5);
        text.x = app.screen.width * xRatio;
        text.y = app.screen.height * yRatio;
        text.originalY = text.y;
        text.interactive = true;
        text.buttonMode = true;
        text.choice = choice;
        text.on("pointerdown", onChoiceSelected);
        app.stage.addChild(text);
        choiceTexts[choice] = text;
    }

    createChoice("rock", 0.25, 0.8);
    createChoice("paper", 0.5, 0.8);
    createChoice("scissors", 0.75, 0.8);

    const resultText = new PIXI.Text({
        text: "",
        style: {
            fill: "#000000",
            fontSize: 24,
        },
    });
    resultText.anchor.set(0.5);
    resultText.x = app.screen.width * 0.5;
    resultText.y = app.screen.height * 0.5;
    app.stage.addChild(resultText);

    let animating = false;
    let resetPending = false;
    let computerText = null;

    function onChoiceSelected(event) {
        if (animating) return;
        animating = true;
        Object.values(choiceTexts).forEach(
            (text) => (text.interactive = false)
        );
        resultText.text = "";
        if (computerText) {
            app.stage.removeChild(computerText);
            computerText.destroy();
            computerText = null;
        }
        const playerChoice = event.currentTarget.choice;
        const playerText = event.currentTarget;
        const originalPlayerY = playerText.y;
        const playerTargetY = originalPlayerY - 20;
        function animatePlayer() {
            playerText.y += (playerTargetY - playerText.y) * 0.2;
            if (Math.abs(playerTargetY - playerText.y) < 1) {
                playerText.y = playerTargetY;
                app.ticker.remove(animatePlayer);
            }
        }
        app.ticker.add(animatePlayer);
        const computerChoice =
            choices[Math.floor(Math.random() * choices.length)];
        const outcome = determineWinner(playerChoice, computerChoice);
        const compStyle = new PIXI.TextStyle({
            fill: "#ffffff",
            fontSize: 36,
        });
        computerText = new PIXI.Text({
            text: emojis[computerChoice],
            style: compStyle,
        });
        computerText.anchor.set(0.5);
        computerText.x = app.screen.width * 0.5;
        computerText.y = -50;
        app.stage.addChild(computerText);
        const compTargetY = app.screen.height * 0.25;
        function update() {
            computerText.y += (compTargetY - computerText.y) * 0.2;
            if (Math.abs(compTargetY - computerText.y) < 1) {
                computerText.y = compTargetY;
                app.ticker.remove(update);
                resultText.text = outcome.toUpperCase();
                if (outcome === "YOU WIN!") {
                    wins++;
                } else if (outcome === "YOU LOSE!") {
                    losses++;
                } else if (outcome === "IT'S A DRAW!") {
                    draws++;
                }
                scoreboardText.text = `Win: ${wins}  Loss: ${losses}  Draw: ${draws}`;
                animating = false;
                resetPending = true;
                app.canvas.addEventListener("pointerdown", canvasReset);
            }
        }
        app.ticker.add(update);
    }

    function determineWinner(player, computer) {
        if (player === computer) return "IT'S A DRAW!";
        if (
            (player === "rock" && computer === "scissors") ||
            (player === "paper" && computer === "rock") ||
            (player === "scissors" && computer === "paper")
        )
            return "YOU WIN!";
        return "YOU LOSE!";
    }

    function resetGameState() {
        Object.values(choiceTexts).forEach((text) => {
            text.y = text.originalY;
            text.interactive = true;
        });
        if (computerText) {
            app.stage.removeChild(computerText);
            computerText.destroy();
            computerText = null;
        }
        resultText.text = "";
        animating = false;
    }

    function canvasReset() {
        if (!resetPending) return;
        app.canvas.removeEventListener("pointerdown", canvasReset);
        resetGameState();
        resetPending = false;
    }

    function fullReset() {
        wins = 0;
        losses = 0;
        draws = 0;
        scoreboardText.text = `Win: ${wins}  Loss: ${losses}  Draw: ${draws}`;
        resetGameState();
    }

    const resetButton = document.getElementById("reset");
    if (resetButton) {
        resetButton.addEventListener("click", fullReset);
    }
}

initSimulation();
