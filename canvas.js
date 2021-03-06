
/*********************************************
 *  CONSTANTS
 ********************************************* */

const TICK_RATE = 10; //ms

const PARTICLE_RADIUS = 5;

const MOVE_FROM_EDGE_TIME = 500;
const MAX_ANGLE = 0.016;

const DISAPPEAR_RATE = 0.005;
const LIFELINE = 800 * DISAPPEAR_RATE + 1; // the first number = ticks until a wisp may disapear.
const SPLIT_CHANCE = 30;
const DISAPPEAR_CHANCE = 300;


var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

var jumpCorrect = false;
var devgraph = false;
var fill = true;


// connects to checkbox; enables or disables dev graphics
$("#devGraphicsCheck").change(function () {
    if ($("#devGraphicsCheck").is(":checked")) {
        devgraph = true;
        fill = false;
    }
    else {
        devgraph = false;
        fill = true;
    }
});


/*********************************************
 *  UTILITY CLASSES
 ********************************************* */
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Vector(this.x, this.y)
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

    copy() {
        return new RadianVector(this.angle, this.magnitude)
    }
}

/*********************************************
 *  WISP
 ********************************************* */

class Wisp {
    constructor() {
        this.lifeLine = LIFELINE;
        this.time = 0;
        //variable for move edge function, used for clearing setInterval after a certain period of time
        this.moveEdgeTimer = 0;

        this.movingFromEdge = false;

        this.particles = [];
    }

    static create(n, x, y, radius, speed, phaseShift) {
        let wisp = new Wisp()
        wisp.phaseShift = phaseShift
        wisp.radius = radius
        wisp.x = x;
        wisp.y = y;
        wisp.n = n;
        wisp.vec = new RadianVector(0, speed)
        return wisp
    }

    split() {
        let wisp = new Wisp()
        wisp.phaseShift = getRnd(0, 6.28);
        wisp.radius = this.radius
        wisp.x = this.x;
        wisp.y = this.y;
        wisp.n = this.n;
        wisp.vec = this.vec.copy()
        return wisp
    }

    draw() {
        // Create gradient
        while (this.particles[0].life <= 0) {
            this.particles.splice(0, 1);
        }
        if (!devgraph) {
            this.particles.forEach(part => {
                part.update();
                part.draw();
            });
        }
        else {
            this.particles.forEach(part => {
                part.update();
            });
            this.drawParticlesLikeVerte();
        }
    }

    drawParticlesLikeVerte() {
        if (this.particles.length > this.n) {
            var particlesToVertRatio = Math.floor(this.particles.length / this.n);
            console.log(`particles = ${this.particles.length} | vertebrae = ${this.n}`);
            var count = 0;
            while (true) {
                console.log(`count = ${count} | part = ${this.particles.length} | count < part = ${count < this.particles.length}`);
                this.particles[count].drawDev();
                count += particlesToVertRatio;
                if (count < this.particles.length) {
                    drawLine(this.particles[count - particlesToVertRatio].x, this.particles[count - particlesToVertRatio].y, this.particles[count].x, this.particles[count].y)

                }
                else {
                    break
                }
            }
        }
    }

    move() {
        //13.75 is an artificial number to approximate a relation between radius and vertebrae count such that the particles appear in similar length to vertebrae
        var lifeTime = this.n * 13.5 * this.radius;

        var pt = new Particle(this.x, this.y, this.radius, lifeTime, this.vec.copy());
        this.particles.push(pt)

        this.changeDirection();
        
        this.x += this.vec.getX();
        this.y += this.vec.getY();
        
        if (jumpCorrect)
            this.moveIfNearEdge();
    }

    changeDirection() {
        this.changeHeadDirection();
    }

    changeHeadDirection() {
        this.time += getRnd(0, 0.01);
        let change = this.directionFunction(this.time + this.phaseShift)
        let biasMag = this.biasMagnitude();
        let biasDir = this.biasDirection()
        this.vec.addAngle((biasDir * biasMag + change * (1 - biasMag)) * MAX_ANGLE);

    }

    biasMagnitude() {
        let x = (this.x - ctx.canvas.width / 2) / ctx.canvas.width * 2
        let y = (this.y - ctx.canvas.height / 2) / ctx.canvas.height * 2
        let distSqrd = Math.pow(x, 2) + Math.pow(y, 2)
        if (distSqrd < Math.pow(0.7, 2))
            return 0;
        distSqrd -= Math.pow(0.7, 2)
        distSqrd /= Math.pow(0.9, 2) - Math.pow(0.7, 2)
        if (distSqrd > 1)
            return 1;
        return distSqrd;
    }

    biasDirection() {
        let curDir = this.vec.angle;
        let x = this.x / ctx.canvas.width;
        let y = this.y / ctx.canvas.height
        if (x == 0.5)
            x += 0.01
        let rate = (y - 0.5) / (x - 0.5)
        let range = Math.PI * 6 / 8;
        switch (true) {
            case (-2.41421356237 > rate):
                curDir -= Math.PI / 2;
                break;
            case (-0.414213562373 > rate):
                range += Math.PI / 4;
                curDir -= 3 * Math.PI / 4;
                break;
            case (0 > rate):
                curDir -= Math.PI;
                break;
            case (0.41421356237 > rate):
                break;
            case (2.41421356237 > rate):
                range += Math.PI / 4;
                curDir -= Math.PI / 4;
                break;
            default:
                curDir -= Math.PI / 2;
        }
        if (y - 0.5 < 0)
            curDir += Math.PI;
        if (curDir >= Math.PI)
            curDir -= 2 * Math.PI;
        if (curDir <= -Math.PI)
            curDir += 2 * Math.PI;
        if (curDir >= Math.PI || curDir <= -Math.PI)
            console.log("weird");
        if (curDir > range || curDir < -range)
            return (0);
        return ((Math.sign(curDir) == 0) ? 1 : Number(Math.sign(curDir)));
    }

    directionFunction(x) {
        return (Math.sin(x) + Math.sin(1.388 * (x + 0.57)) + Math.sin(0.897 * (x + 2.047)) + Math.sin(1.288 * (x + 4.856)) + Math.sin(1.727 * (x + 2.866))) / 4;
    }

    moveWispByDots(dx, dy, wisp, ctx) {
        wisp.x += dx;
        wisp.y += dy;

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

        if (this.x >= ctx.canvas.width) {
            dist = ctx.canvas.width / 1.5 / MOVE_FROM_EDGE_TIME * 10;
            x = -1;
        }
        if (this.x <= 0) {
            dist = ctx.canvas.width / 1.5 / MOVE_FROM_EDGE_TIME * 10;
            x = 1;
        }
        if (this.y >= ctx.canvas.height) {
            dist = ctx.canvas.height / 1.5 / MOVE_FROM_EDGE_TIME * 10;
            y = -1;
        }
        if (this.y <= 0) {
            dist = ctx.canvas.height / 1.5 / MOVE_FROM_EDGE_TIME * 10;
            y = 1;
        }

        if (dist) {
            this.movingFromEdge = true;
            this.interval = setInterval(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.moveWispByDots(x * dist, y * dist, this, ctx)
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

/******************************************
 * Particle system
 *****************************************/
class Particle {
    constructor(x, y, radius, lifeSpan, dirVec, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.viewRadius = radius;
        this.lifeSpan = lifeSpan;
        this.life = this.lifeSpan;
        this.dirVec = dirVec;
        this.dirVec.magnitude *= -0.1;
    }

    static createParticle(x, y, lifeSpan, dirVec, color) {
        return new Particle(x, y, PARTICLE_RADIUS, lifeSpan, dirVec, color);
    }

    update() {
        this.x += this.dirVec.getX();
        this.y += this.dirVec.getY();
        this.viewRadius = this.radius * this.life / this.lifeSpan;
        this.life -= 10;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(125, 225, ${255 * this.life / this.lifeSpan}, ${this.life / this.lifeSpan})`;
        ctx.arc(this.x, this.y, this.viewRadius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    drawDev() {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 0, 1)";
        ctx.arc(this.x, this.y, this.viewRadius, 0, Math.PI * 2, false);
        ctx.stroke();
    }
}

/*********************************************
 *  UTILITY FUNCTIONS
 ********************************************* */

function devGraphics() {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 155, 155, 1)";
    ctx.ellipse(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.35, ctx.canvas.height * 0.35, 0, 0, 2 * Math.PI)
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(155, 255, 155, 1)";
    ctx.ellipse(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.45, ctx.canvas.height * 0.45, 0, 0, 2 * Math.PI)
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(155, 155, 155, 1)";
    let tanPI = Math.tan(Math.PI / 8)
    let tanMPI = Math.tan(-Math.PI / 8)
    ctx.moveTo(ctx.canvas.width, (tanPI * ctx.canvas.height + ctx.canvas.height) / 2);
    ctx.lineTo(0, (tanMPI * ctx.canvas.height + ctx.canvas.height) / 2);

    ctx.moveTo(0, (tanPI * ctx.canvas.height + ctx.canvas.height) / 2);
    ctx.lineTo(ctx.canvas.width, (tanMPI * ctx.canvas.height + ctx.canvas.height) / 2);

    ctx.moveTo((tanPI * ctx.canvas.width + ctx.canvas.width) / 2, ctx.canvas.height)
    ctx.lineTo((tanMPI * ctx.canvas.width + ctx.canvas.width) / 2, 0);

    ctx.moveTo((tanMPI * ctx.canvas.width + ctx.canvas.width) / 2, ctx.canvas.height)
    ctx.lineTo((tanPI * ctx.canvas.width + ctx.canvas.width) / 2, 0);
    ctx.stroke()
}

function getRndInt(min, max) {
    return Math.floor(getRnd(min, max));
}

function getRnd(min, max) {
    return (Math.random() * (max - min)) + min;
}

$(window).on('resize', function () {
    var win = $(this); //this = windowwisp, index
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
});

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wisps.forEach(iterate);
    if (devgraph) {
        devGraphics();
    }
}, TICK_RATE);

function iterate(wisp, index) {
    if (!wisp.movingFromEdge) {
        if (wisp.lifeLine == 0) {
            wisps.splice(index, 1);
            return;
        }
        wisp.move();
        if (wisp.lifeLine != 1) {
            wisp.lifeLine -= DISAPPEAR_RATE
            wisp.lifeLine = Math.round(wisp.lifeLine * 1000) / 1000
        }
        else {
            if (getRndInt(0, DISAPPEAR_CHANCE) == 0 && activeWisps > 1) {
                activeWisps -= 1
                wisp.lifeLine -= DISAPPEAR_RATE
            }
            else if (getRndInt(0, SPLIT_CHANCE * activeWisps) == 0) {
                activeWisps += 1
                wisps.push(wisp.split())
                wisp.lifeLine = LIFELINE
            }
        }
        wisp.draw();
    }
}

function drawLine(startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(125, 225, 250, 1)";
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function main() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    wisps = [];
    wisps.push(Wisp.create(20, ctx.canvas.width / 2, ctx.canvas.height / 2, 7, 0.6, getRnd(0, 6.28)));
    activeWisps = 1
}

main()
