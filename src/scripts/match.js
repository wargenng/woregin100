import * as PIXI from "pixi.js";

async function initCardMatchingGame() {
    const app = new PIXI.Application();
    await app.init({
        width: 380,
        height: 380,
        backgroundColor: "#f1f1ef",
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    document.getElementById("match").innerHTML = ""; // Clears previous game canvas
    document.getElementById("match").appendChild(app.canvas);

    let suits = ["♠️", "♥️", "♦️", "♣️"];
    let deck, cards, flippedCards, matchedPairs, lives, livesDisplay;

    function startGame() {
        app.stage.removeChildren(); // Clear all objects without removing the canvas
        deck = [...suits, ...suits].sort(() => Math.random() - 0.5);
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        lives = 3;

        livesDisplay = new PIXI.Text({
            text: `❤️ ❤️ ❤️`,
            style: {
                fill: "#000000",
                fontSize: 24,
                fontFamily: "Arial",
            },
        });
        livesDisplay.anchor.set(0, 0);
        livesDisplay.x = 10;
        livesDisplay.y = 10;
        app.stage.addChild(livesDisplay);

        const cardWidth = 80;
        const cardHeight = 120;
        const cardSpacingX = 10;
        const cardSpacingY = 10;
        const startX =
            (app.screen.width -
                (4 * (cardWidth + cardSpacingX) - cardSpacingX)) /
            2;
        const startY =
            (app.screen.height -
                (2 * (cardHeight + cardSpacingY) - cardSpacingY)) /
            2;

        function createCard(index, suit) {
            const card = new PIXI.Container();
            const back = new PIXI.Graphics()
                .rect(0, 0, cardWidth, cardHeight)
                .fill(0x000000);
            const face = new PIXI.Text({
                text: suit,
                style: {
                    fill: "#ffffff",
                    fontSize: 48,
                    fontFamily: "Arial",
                },
            });
            face.anchor.set(0.5);
            face.x = cardWidth / 2;
            face.y = cardHeight / 2;
            face.visible = false;

            card.addChild(back, face);
            card.interactive = true;
            card.buttonMode = true;
            card.x = startX + (index % 4) * (cardWidth + cardSpacingX);
            card.y =
                startY + Math.floor(index / 4) * (cardHeight + cardSpacingY);
            card.on("pointerdown", () => flipCard(card, suit, face, back));

            app.stage.addChild(card);
            return { container: card, suit, face, back };
        }

        function flipCard(card, suit, face, back) {
            if (flippedCards.length < 2 && !face.visible) {
                face.visible = true;
                back.visible = false;
                flippedCards.push({ card, suit, face, back });

                if (flippedCards.length === 2) {
                    setTimeout(checkMatch, 1000);
                }
            }
        }

        function checkMatch() {
            const [first, second] = flippedCards;

            if (first.suit === second.suit) {
                matchedPairs++;
                if (matchedPairs === suits.length) {
                    showResult("YOU WIN!");
                }
            } else {
                first.face.visible = false;
                first.back.visible = true;
                second.face.visible = false;
                second.back.visible = true;
                lives--;
                updateLives();
                if (lives <= 0) {
                    showResult("GAME OVER");
                }
            }
            flippedCards = [];
        }

        function updateLives() {
            livesDisplay.text = Array(lives).fill("❤️").join(" ");
        }

        function showResult(message) {
            const resultText = new PIXI.Text({
                text: message,
                style: {
                    fill: "#ff0000",
                    fontSize: 48,
                    fontFamily: "Arial",
                },
            });
            resultText.anchor.set(0.5);
            resultText.x = app.screen.width / 2;
            resultText.y = app.screen.height / 2;
            app.stage.addChild(resultText);

            app.stage.interactive = true;
            app.stage.once("pointerdown", () => {
                app.stage.interactive = false;
                startGame();
            });
        }

        deck.forEach((suit, index) => cards.push(createCard(index, suit)));
    }

    startGame(); // Start the game
}

initCardMatchingGame();
