const MOVE_FROM_EDGE_TIME = 500;
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

var jumpCorrect = true;
var devgraph = false;
var fill = true;

$("#devGraphicsCheck").change(function () {
    devgraph = !devgraph;
});

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class RadianVector {
    constructor(angle, magnitude) {
        this.angle = angle;
        this.magnitude = magnitude;
    }

    getX() {
        return this.magnitude * Math.cos(this.angle)
    }

    getY() {
        return this.magnitude * Math.sin(this.angle)
    }

    addAngle(angle) {
        this.angle += angle;
        if (this.angle > 3.142)
            this.angle -= 2 * Math.PI
        if (this.angle < -3.142)
            this.angle += 2 * Math.PI
    }
}

class BezierCurve {
    constructor(start, end, controlStart, controlEnd) {
        this.start = start;
        this.end = end;
        this.controlStart = controlStart;
        this.controlEnd = controlEnd;
    }

    static createBezier(xs, ys, xe, ye, xcs, ycs, xce, yce) {
        return new BezierCurve(new Vector(xs, ys), new Vector(xe, ye), new Vector(xcs, ycs), new Vector(xce, yce));
    }

    setStart = (x, y) => {
        this.start.x = x;
        this.start.y = y;
    }

    setEnd = (x, y) => {
        this.end.x = x;
        this.end.y = y;
    }

    setControlStart = (x, y) => {
        this.controlStart.x = x;
        this.controlStart.y = y;
    }

    setControlEnd = (x, y) => {
        this.controlEnd.x = x;
        this.controlEnd.y = y;
    }

    draw() {
        ctx.moveTo(this.start.x, this.start.y);
        ctx.bezierCurveTo(this.controlStart.x, this.controlStart.y, this.controlEnd.x, this.controlEnd.y, this.end.x, this.end.y);
    }
    drawBack() {
        ctx.moveTo(this.end.x, this.end.y);
        ctx.bezierCurveTo(this.controlEnd.x, this.controlEnd.y, this.controlStart.x, this.controlStart.y, this.start.x, this.start.y);
    }
}

class Vertebra {
    prev = null;
    curve1 = BezierCurve.createBezier(0, 0, 0, 0, 0, 0, 0, 0);
    curve2 = BezierCurve.createBezier(0, 0, 0, 0, 0, 0, 0, 0);

    constructor(x, y, radius, vec, next) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vec = vec;
        this.next = next;
        if (next) {
            this.calcCosSin();
        }
    }

    static createVert(x, y, radius, next) {
        return new Vertebra(x, y, radius, new RadianVector(0, next.vec.magnitude), next);
    }

    draw() {
        var sinR = this.radius * this.sin;
        var cosR = this.radius * this.cos;
        if (this.next) {
            var sinNextR = this.next.radius * this.sin;
            var cosNextR = this.next.radius * this.cos;
        }

        if (this.prev == null) {
            this.curve1.setStart(this.x - 2 * cosR, this.y - 2 * sinR);
            this.curve2.setStart(this.curve1.start.x, this.curve1.start.y);

            this.curve1.setControlStart(this.x - sinR, this.y + cosR);
            this.curve2.setControlStart(this.x + sinR, this.y - cosR);

            this.curve1.setEnd(this.next.x - sinNextR, this.next.y + cosNextR);
            this.curve2.setEnd(this.next.x + sinNextR, this.next.y - cosNextR);

            this.curve1.setControlEnd(this.next.x - sinNextR, this.next.y + cosNextR);
            this.curve2.setControlEnd(this.next.x + sinNextR, this.next.y - cosNextR);

        }
        else {
            this.curve1.start = this.prev.curve1.end;
            this.curve2.start = this.prev.curve2.end;
            var prevSinR = this.radius * this.prev.sin;
            var prevCosR = this.radius * this.prev.cos;

            this.curve1.setControlStart(this.x - prevSinR + prevCosR, this.y + prevCosR + prevSinR);
            this.curve2.setControlStart(this.x + prevSinR + prevCosR, this.y - prevCosR + prevSinR);

            if (this.next == null) {
                this.curve1.setEnd(this.x + prevCosR, this.y + prevSinR);
                this.curve2.end = this.curve1.end;

                this.curve1.controlEnd = this.curve1.end;
                this.curve2.controlEnd = this.curve1.end;
            }
            else {
                this.curve1.setEnd(this.next.x - sinNextR, this.next.y + cosNextR);
                this.curve2.setEnd(this.next.x + sinNextR, this.next.y - cosNextR);

                this.curve1.setControlEnd(this.next.x - sinNextR, this.next.y + cosNextR);
                this.curve2.setControlEnd(this.next.x + sinNextR, this.next.y - cosNextR);
            }
        }
        this.curve1.draw()
        ctx.lineTo(this.curve2.end.x, this.curve2.end.y);
        this.curve2.drawBack();
        ctx.lineTo(this.curve1.start.x, this.curve1.start.y);

        if (this.next) {
            this.next.draw();
        }
    }

    devGraphics() {
        let radius = this.radius/7;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 0, 0, 1)";
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();

        ctx.strokeStyle = "rgba(0, 255, 0, 1)";
        ctx.arc(this.curve1.controlStart.x, this.curve1.controlStart.y, radius, 0, 2 * Math.PI);
        ctx.arc(this.curve2.controlStart.x, this.curve2.controlStart.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();

        ctx.strokeStyle = "rgba(200, 100, 255, 1)";
        ctx.arc(this.curve1.controlEnd.x, this.curve1.controlEnd.y, radius, 0, 2 * Math.PI);
        ctx.arc(this.curve2.controlEnd.x, this.curve2.controlEnd.y, radius, 0, 2 * Math.PI);

        ctx.stroke();   
        ctx.beginPath();
        ctx.strokeStyle = "rgba(125, 225, 250, 1)";
        ctx.moveTo(this.x, this.y);
        if (this.next) {   
            ctx.lineTo(this.next.x, this.next.y);
            ctx.stroke();
            this.next.devGraphics();
        }
        else{
            ctx.lineTo(this.x + 20 * this.vec.getX(), this.y + 20 * this.vec.getY())
            ctx.stroke();
        }
    }

    //calculates the cos and sin of this vertabrae
    calcCosSin() {
        if (!this.next)
            return;
        let dist = Math.sqrt(Math.pow(this.x - this.next.x, 2) + Math.pow(this.y - this.next.y, 2));
        this.cos = (this.next.x - this.x) / dist;
        this.sin = (this.next.y - this.y) / dist;
    }

    //moves the rest of the vertabrae in accordance to the head's movement
    move() {
        if (this.next) {
            let dist = Math.sqrt(Math.pow(this.x - this.next.x, 2) + Math.pow(this.y - this.next.y, 2));

            if (dist < this.radius * 2.5) {
                return;
            }
        }
        this.x += this.vec.getX();
        this.y += this.vec.getY();
        this.calcCosSin();
        if (this.prev) {
            this.prev.move();
        }
    }

    changeDirection() {
        if (this.next)
            this.vec.angle = Math.atan2(this.next.y - this.y, this.next.x - this.x)
        if (this.prev)
            this.prev.changeDirection();
    }
}

class Wisp {
    constructor(n, x, y, radius, speed) {
        this.time = 0;
        this.MAX_ANGLE = 0.016;
        this.radius = radius
        this.vertebrae = [];
        let r = 0
        let vert = null
        for (let i = 0; i < n; i++) {
            r = this.radius * this.rate(n, i)
            if (i == 0) {
                this.vertebrae.push(new Vertebra(Math.floor(x), y, r, new RadianVector(0, speed), vert))
            }

            else
                this.vertebrae.push(Vertebra.createVert(Math.floor(x), y, r, vert))
            x -= 2.5 * r
            if (vert)
                vert.prev = this.vertebrae[i]
            vert = this.vertebrae[i]
        }

        //variable for move edge function, used for clearing setInterval after a certain period of time
        this.moveEdgeTimer = 0;

        this.movingFromEdge = false;
    }

    // rate between radius of vertebras
    rate(n, i) {
        return 1 / (1 + 15 * (i / n) * (i / n))
    }

    draw() {
        // Create gradient
        var grd = ctx.createLinearGradient(this.vertebrae[this.vertebrae.length - 1].x, this.vertebrae[this.vertebrae.length - 1].y, this.vertebrae[0].x, this.vertebrae[0].y);
        grd.addColorStop(0, "rgba(100, 0, 255, 0)");
        grd.addColorStop(1, "rgba(100, 0, 255, 1)");
        ctx.beginPath();
        this.vertebrae[this.vertebrae.length - 1].draw();
        if (fill) {
            ctx.fillStyle = grd;
            ctx.fill();
        }
        else {
            ctx.strokeStyle = grd;
            ctx.stroke();
        }
        if (devgraph)
            this.vertebrae[this.vertebrae.length - 1].devGraphics();
    }

    move() {
        this.changeDirection();
        this.vertebrae[0].move();
        if (jumpCorrect)
            wisp.moveIfNearEdge();
    }

    changeDirection() {
        this.changeHeadDirection();
        this.vertebrae[0].changeDirection();
    }

    changeHeadDirection() {
        this.time += getRnd(0, 0.01);
        let change = this.directionFunction(this.time)
        this.vertebrae[0].vec.addAngle(change);

    }

    directionFunction(x) {
        return 0.016 / 4 * (Math.sin(x) + Math.sin(1.388 * (x + 0.57)) + Math.sin(0.897 * (x + 2.047)) + Math.sin(1.288 * (x + 4.856)) + Math.sin(1.727 * (x + 2.866)));
    }

    moveWispByDots(dx, dy, vert, ctx) {
        vert.x += dx;
        vert.y += dy;

        if (vert.prev) {
            this.moveWispByDots(dx, dy, vert.prev, ctx);
        }
        else {
            this.draw();
        }
    }

    moveIfNearEdge() {
        let dist = 0;
        let x = 0;
        let y = 0;

        if (this.vertebrae[0].x >= ctx.canvas.width) {
            dist = ctx.canvas.width / 1.5 / MOVE_FROM_EDGE_TIME * 10;
            x = -1;
        }
        if (this.vertebrae[0].x <= 0) {
            dist = ctx.canvas.width / 1.5 / MOVE_FROM_EDGE_TIME * 10;
            x = 1;
        }
        if (this.vertebrae[0].y >= ctx.canvas.height) {
            dist = ctx.canvas.height / 1.5 / MOVE_FROM_EDGE_TIME * 10;
            y = -1;
        }
        if (this.vertebrae[0].y <= 0) {
            dist = ctx.canvas.height / 1.5 / MOVE_FROM_EDGE_TIME * 10;
            y = 1;
        }

        if (dist) {
            this.movingFromEdge = true;
            this.interval = setInterval(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.moveWispByDots(x * dist, y * dist, this.vertebrae[0], ctx)
                this.moveEdgeTimer += 10;
                if (this.moveEdgeTimer == MOVE_FROM_EDGE_TIME) {
                    this.moveEdgeTimer = 0;
                    this.movingFromEdge = false;
                    clearInterval(this.interval);
                }
            }, 10);
        }
    }
}

class Particle {
    constructor(x, y, radius, lifeSpan, dirVec) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.lifeSpan = lifeSpan;
        this.life = this.lifeSpan;
        this.dirVec = new Vector(dirVec.x * getRndInt(0, 4) - 2, dirVec.y * getRndInt(0, 4) - 2);
    }

    update() {
        this.x += this.dirVec.x;
        this.y += this.dirVec.y;
        this.radius *= this.life / this.lifeSpan
        this.life -= 10;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    }
}


$(window).on('resize', function () {
    var win = $(this); //this = window
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
});

setInterval(() => {
    if (!wisp.movingFromEdge) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        wisp.move();
        wisp.draw();
    }
}, 10);

function getRndInt(min, max) {
    return Math.floor(getRnd(min, max));
}

function getRnd(min, max) {
    return (Math.random() * (max - min)) + min;
}

function main() {
    wisp = new Wisp(20, 400, 400, 31, 3);
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}
main()