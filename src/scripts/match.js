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

    document.getElementById("match").innerHTML = "";
    document.getElementById("match").appendChild(app.canvas);

    let suits = ["♠️", "♥️", "♦️", "♣️"];
    let deck, cards, flippedCards, matchedPairs, lives, livesDisplay;

    function startGame() {
        app.stage.removeChildren();
        deck = [...suits, ...suits].sort(() => Math.random() - 0.5);
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        lives = 3;

        livesDisplay = new PIXI.Text({
            text: `❤️ ❤️ ❤️`,
            style: {
                fill: "#ffffff",
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
        const cardRadius = 12; // Rounded corner radius
        const strokeWidth = 2; // Thin black stroke
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

            // Light grey back with rounded corners and black stroke
            const back = new PIXI.Graphics()
                .roundRect(0, 0, cardWidth, cardHeight, cardRadius)
                .fill(0xd3d3d3) // Light grey
                .stroke({ width: strokeWidth, color: 0x000000 }); // Black stroke

            // White front with rounded corners and black stroke
            const front = new PIXI.Graphics()
                .roundRect(0, 0, cardWidth, cardHeight, cardRadius)
                .fill(0xffffff) // White
                .stroke({ width: strokeWidth, color: 0x000000 }); // Black stroke

            const face = new PIXI.Text({
                text: suit,
                style: {
                    fill: "#000000",
                    fontSize: 48,
                    fontFamily: "Arial",
                },
            });
            face.anchor.set(0.5);
            face.x = cardWidth / 2;
            face.y = cardHeight / 2;
            face.visible = false;

            card.addChild(front, back, face);
            card.interactive = true;
            card.buttonMode = true;
            card.x = startX + (index % 4) * (cardWidth + cardSpacingX);
            card.y = -150; // Start off-screen for animation
            card.targetY =
                startY + Math.floor(index / 4) * (cardHeight + cardSpacingY);
            card.on("pointerdown", () =>
                flipCard(card, suit, face, back, front)
            );

            app.stage.addChild(card);
            return { container: card, suit, face, back, front };
        }

        function flipCard(card, suit, face, back, front) {
            if (flippedCards.length < 2 && !face.visible) {
                face.visible = true;
                back.visible = false;
                front.visible = true;
                flippedCards.push({ card, suit, face, back, front });

                if (flippedCards.length === 2) {
                    setTimeout(checkMatch, 700);
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
                first.front.visible = false;
                second.face.visible = false;
                second.back.visible = true;
                second.front.visible = false;
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

        function dealCards(index = 0) {
            if (index >= cards.length) return;
            let card = cards[index].container;
            let animationSpeed = 12;

            function dropAnimation() {
                if (card.y < card.targetY) {
                    card.y += animationSpeed;
                    requestAnimationFrame(dropAnimation);
                } else {
                    setTimeout(() => dealCards(index + 1), 50);
                }
            }

            dropAnimation();
        }

        dealCards();
    }

    startGame();
}

initCardMatchingGame();
