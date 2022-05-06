const MAX_MAGNITUDE = 7;
const MOVE_FROM_EDGE_TIME = 500;
const CHANGE_DIR_TIMER = 10000;
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

var jumpCorrect = true;
var devgraph = false;
var fill = true;

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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
        return new Vertebra(x, y, radius, null, next);
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
        ctx.strokeStyle = "rgba(255, 0, 0, 1)";
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();

        if (this.prev) {
            ctx.arc(this.x - this.radius * this.prev.sin + this.radius * this.prev.cos, this.y + this.radius * this.prev.cos + this.radius * this.prev.sin, 5, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.arc(this.x + this.radius * this.prev.sin + this.radius * this.prev.cos, this.y - this.radius * this.prev.cos + this.radius * this.prev.sin, 5, 0, 2 * Math.PI);
            ctx.stroke();
        }
        if (this.next) {
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.next.x, this.next.y);
            ctx.stroke();
            this.next.devGraphics();
        }
    }

    //calculates the cos and sin of this vertabrae ahead of time for faster computations.
    calcCosSin() {
        let dist = Math.sqrt(Math.pow(this.x - this.next.x, 2) + Math.pow(this.y - this.next.y, 2));
        this.cos = (this.next.x - this.x) / dist;
        this.sin = (this.next.y - this.y) / dist;
    }

    //moves the head of the vertabrae according to the vector, pulling the rest of the vertabrae along in accordance
    move() {
        //intensity of change
        let num = 0.1;
        let type = getRndInt(1, 3);
        let positive, magnitude, newVec;


        switch (type) {
            //change x of movement vector
            case 1:
                //0 = decrease, 1 = increase
                positive = getRndInt(0, 1);
                if (positive == 0) {
                    num *= -1;

                }
                if (this.dirRight && num > 0) {
                    num *= 2;
                }
                else if (!this.dirRight && num < 0) {
                    num *= 2;
                }

                //check if new vector's magnitude is smaller than max magnitude
                magnitude = Math.sqrt(Math.pow(this.vec.x + num, 2) + Math.pow(this.vec.y, 2));

                if (magnitude <= MAX_MAGNITUDE && magnitude >= 0.5) {

                    newVec = new Vector(this.vec.x + num, this.vec.y);
                    if (Math.abs(this.anglePrev() - this.angleOfVec(newVec)) < 50) {
                        this.vec.x += num;
                    }
                }
                break;

            //change y of movement vector
            case 2:
                //0 = decrease, 1 = increase
                positive = getRndInt(0, 1);
                if (positive == 0) {
                    num *= -1;
                }

                //check if new vector's magnitude is smaller than max magnitude
                magnitude = Math.sqrt(Math.pow(this.vec.x, 2) + Math.pow(this.vec.y + num, 2));
                if (magnitude <= MAX_MAGNITUDE && magnitude > 0.5) {

                    newVec = new Vector(this.vec.x, this.vec.y + num);

                    if (Math.abs(this.anglePrev() - this.angleOfVec(newVec)) < 50) {
                        this.vec.y += num;
                    }
                }
                break;
        }

        let dist = Math.sqrt(Math.pow(this.vec.x, 2) + Math.pow(this.vec.y, 2));
        this.x += this.vec.x;
        this.y += this.vec.y;

        this.changePrev(dist);
        if (jumpCorrect)
            wisp.moveIfNearEdge();
    }


    //angle of the previous vertabrae to this one
    anglePrev() {
        return Math.atan2((this.y - this.prev.y), (this.x - this.prev.x)) * 180 / Math.PI;
    }

    //angle of the vector to the head
    angleOfVec(vec) {
        return Math.atan2(vec.y, vec.x) * 180 / Math.PI;
    }


    //moves the rest of the vertabrae in accordance to the head's movement
    changePrev(dist) {
        if (this.prev) {

            let fairDist = 1;
            let distToPrev = Math.sqrt(Math.pow(this.x - this.prev.x, 2) + Math.pow(this.y - this.prev.y, 2));

            if (distToPrev < this.radius * 3) {
                if (distToPrev < this.radius * 2.5) {
                    return;
                }
                fairDist / 4;
            }
            this.prev.x += this.prev.cos * dist * fairDist;
            this.prev.y += this.prev.sin * dist * fairDist;
            this.prev.calcCosSin();
            this.prev.changePrev(dist);
        }
    }
}

class Wisp {

    constructor(n, x, y, radius) {
        this.radius = radius
        this.x = x
        this.y = y
        this.vertebrae = [];
        let r = 0
        let vert = null
        for (let i = 0; i < n; i++) {
            r = this.radius * this.rate(n, i)
            if (i == 0) {
                this.vertebrae.push(new Vertebra(Math.floor(x), y, r, new Vector(0.5, 0), vert))
            }

            else
                this.vertebrae.push(Vertebra.createVert(Math.floor(x), y, r, vert))
            x -= 1 * r
            if (vert)
                vert.prev = this.vertebrae[i]
            vert = this.vertebrae[i]
            console.log(vert.x);
        }

        //variable for move edge function, used for clearing setInterval after a certain period of time
        this.moveEdgeTimer = 0;

        this.movingFromEdge = false;

        this.vertebrae[0].dirRight = false;

        //makes the wisp move more to the right/the left every CHANGE_DIR_TIMER miliseconds
        //used to make the wisp's movements less monotone, as well as makeing it move in a circular manner
        setInterval(() => {
            this.vertebrae[0].dirRight = !this.vertebrae[0].dirRight;
        }, CHANGE_DIR_TIMER)
    }

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
        this.vertebrae[0].move();
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
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function main() {
    wisp = new Wisp(20, 400, 400, 31);
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}
main()