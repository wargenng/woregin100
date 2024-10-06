import paper from "paper";
import "@fontsource/merriweather";

const canvas = document.getElementById("lavalamp");
paper.setup(canvas);
const balls = [];

class Ball {
    constructor(r, p, v, isNew = false) {
        this.radius = isNew ? 0 : r;
        this.targetRadius = r;
        this.point = p;
        this.vector = v;
        this.maxVec = 1 * (r / 100);
        this.numSegment = Math.max(12, Math.floor(r / 3 + 2));
        this.boundOffset = [];
        this.boundOffsetBuff = [];
        this.sidePoints = [];
        this.isGrowing = isNew;
        this.isShrinking = false;
        this.growthRate = r / 30;
        this.path = new paper.Path({
            fillColor: {
                gradient: {
                    stops: [
                        ["#ff5f6d", 0.2],
                        ["#ffc371", 1],
                    ],
                    radial: true,
                },
                origin: this.point,
                destination: this.point.add(new paper.Point(0, r)),
            },
            blendMode: "lighter",
        });

        // initialize the ball's shape by creating segments around a circle
        for (let i = 0; i < this.numSegment; i++) {
            this.boundOffset.push(this.radius);
            this.boundOffsetBuff.push(this.radius);
            this.path.add(new paper.Point());
            this.sidePoints.push(
                new paper.Point({
                    angle: (360 / this.numSegment) * i,
                    length: 1,
                })
            );
        }
    }

    iterate() {
        // handle growth
        if (this.isGrowing) {
            this.radius += this.growthRate;
            if (this.radius >= this.targetRadius) {
                this.radius = this.targetRadius;
                this.isGrowing = false;
            }
            this.updateProperties();
        }

        // handle shrinkage
        if (this.isShrinking) {
            this.radius -= this.growthRate;
            if (this.radius <= 0) {
                this.radius = 0;
                this.remove(); // remove the ball when fully shrunk
                return;
            }
            this.updateProperties();
        }

        // move the ball and update its shape
        this.checkBorders();
        if (this.vector.length > this.maxVec)
            this.vector = this.vector.normalize(this.maxVec);
        this.point = this.point.add(this.vector);
        this.updateShape();
    }

    updateProperties() {
        this.maxVec = 1 * (this.radius / 100);
        this.growthRate = this.targetRadius / 30; // update growth rate if needed

        // update bound offsets
        for (let i = 0; i < this.numSegment; i++) {
            this.boundOffset[i] = this.radius;
            this.boundOffsetBuff[i] = this.radius;
        }

        // update gradient destination
        this.path.fillColor.destination = this.point.add(
            new paper.Point(0, this.radius)
        );
    }

    remove() {
        // remove the ball's path from the canvas
        this.path.remove();
        // remove the ball from the balls array
        const index = balls.indexOf(this);
        if (index > -1) {
            balls.splice(index, 1);
        }
    }

    checkBorders() {
        // wrap the ball around the edges of the canvas
        const { width, height } = paper.view.size;
        if (this.point.x < -this.radius) this.point.x = width + this.radius;
        if (this.point.x > width + this.radius) this.point.x = -this.radius;
        if (this.point.y < -this.radius) this.point.y = height + this.radius;
        if (this.point.y > height + this.radius) this.point.y = -this.radius;
    }

    updateShape() {
        // update the position of each segment to form the blob shape
        const segments = this.path.segments;
        for (let i = 0; i < this.numSegment; i++) {
            segments[i].point = this.getSidePoint(i);
        }

        this.path.position = this.point; // ensure the path moves with the point
        this.path.smooth();

        // adjust the offsets for a smooth, organic shape
        for (let i = 0; i < this.numSegment; i++) {
            if (this.boundOffset[i] < this.radius / 4)
                this.boundOffset[i] = this.radius / 4;
            const next = (i + 1) % this.numSegment;
            const prev = i > 0 ? i - 1 : this.numSegment - 1;
            let offset = this.boundOffset[i];
            offset += (this.radius - offset) / 15;
            offset +=
                ((this.boundOffset[next] + this.boundOffset[prev]) / 2 -
                    offset) /
                3;
            this.boundOffsetBuff[i] = this.boundOffset[i] = offset;
        }
    }

    react(b) {
        // make the balls react to each other when they collide
        const dist = this.point.getDistance(b.point);
        if (dist < this.radius + b.radius && dist !== 0) {
            const overlap = this.radius + b.radius - dist;
            const direction = this.point
                .subtract(b.point)
                .normalize(overlap * 0.015);
            this.vector = this.vector.add(direction);
            b.vector = b.vector.subtract(direction);

            this.calcBounds(b);
            b.calcBounds(this);
            this.updateBounds();
            b.updateBounds();
        }
    }

    getBoundOffset(b) {
        // get the offset for the boundary at a given point
        const diff = this.point.subtract(b);
        const angle = (diff.angle + 180) % 360;
        return this.boundOffset[
            Math.floor((angle / 360) * this.boundOffset.length)
        ];
    }

    calcBounds(b) {
        // calculate the deformation of the ball upon collision
        for (let i = 0; i < this.numSegment; i++) {
            const tp = this.getSidePoint(i);
            const bLen = b.getBoundOffset(tp);
            const td = tp.getDistance(b.point);
            if (td < bLen) {
                this.boundOffsetBuff[i] -= (bLen - td) / 2;
            }
        }
    }

    getSidePoint(index) {
        // get the position of a segment point on the side of the ball
        return this.point.add(
            this.sidePoints[index].multiply(this.boundOffset[index])
        );
    }

    updateBounds() {
        // update the boundary offsets after deformation
        for (let i = 0; i < this.numSegment; i++) {
            this.boundOffset[i] = this.boundOffsetBuff[i];
        }
    }
}

class TextItem {
    constructor(content, position, offset) {
        this.text = new paper.PointText({
            point: position.add(offset),
            content: content,
            fillColor: "#0F0F0F",
            fontFamily: "Merriweather",
            fontSize: 140,
            justification: "center",
        });

        this.text.scale(1.2, 1.85);
    }
}

//--------------------- main ---------------------

// create text items
const center = paper.view.center;
const lavaText = new TextItem("LAVA", center, new paper.Point(0, -40));
const lampText = new TextItem("LAMP", center, new paper.Point(0, 155));

// move text to background
lavaText.text.sendToBack();
lampText.text.sendToBack();

// create balls with varying sizes and positions
const numBalls = 10;
const minRadius = 5;
const maxRadius = 150;
for (let i = 0; i < numBalls; i++) {
    const position = paper.Point.random().multiply(paper.view.size);
    const vector = new paper.Point({
        angle: 360 * Math.random(),
        length: Math.random() * 0.5,
    });
    const radius = Math.random() * (maxRadius - minRadius) + minRadius;
    const newBall = new Ball(radius, position, vector);
    balls.push(newBall);
}

// ensure balls are in front of the text
balls.forEach((ball) => {
    ball.path.bringToFront();
});

// animation loop
paper.view.onFrame = () => {
    // make balls react to each other
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            balls[i].react(balls[j]);
        }
    }
    // update each ball's position and shape
    for (const ball of balls) {
        ball.iterate();
    }
};

// set up a timer to remove and add circles every 3 seconds
setInterval(() => {
    // remove a random ball
    if (balls.length > 0) {
        const index = Math.floor(Math.random() * balls.length);
        const ballToRemove = balls[index];
        // start the shrink animation
        ballToRemove.isShrinking = true;
    }

    // spawn a new ball
    const position = paper.Point.random().multiply(paper.view.size);
    const vector = new paper.Point({
        angle: 360 * Math.random(),
        length: Math.random() * 0.5, // same as before
    });
    const radius = Math.random() * (maxRadius - minRadius) + minRadius;
    const newBall = new Ball(radius, position, vector, true); // pass true for isNew
    // ensure the new ball is in front of the text
    newBall.path.bringToFront();
    // add the new ball to the array
    balls.push(newBall);
}, 5000);
