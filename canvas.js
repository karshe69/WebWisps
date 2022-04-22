const MAX_MAGNITUDE = 7;
const MOVE_FROM_EDGE_TIME = 500;
const CHANGE_DIR_TIMER = 10000;

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class QuadeCurve {
    constructor(start, end, control) {
        this.start = start;
        this.end = end;
        this.control = control;
    }

    static constr(xs, ys, xe, ye, xc, yc) {
        return new QuadeCurve(new Vector(xs, ys), new Vector(xe, ye), new Vector(xc, yc));
    }

    setStart = (x, y) => {
        this.start.x = x;
        this.start.y = y;
    }

    setEnd = (x, y) => {
        this.end.x = x;
        this.end.y = y;
    }

    setControl = (x, y) => {
        this.control.x = x;
        this.control.y = y;
    }

    draw(ctx) {
        ctx.moveTo(this.start.x, this.start.y);
        ctx.quadraticCurveTo(this.control.x, this.control.y, this.end.x, this.end.y);
    }
}

// class Vertebra {
//     prev = null;
//     curve1 = QuadeCurve.constr(0, 0, 0, 0, 0, 0);
//     curve2 = QuadeCurve.constr(0, 0, 0, 0, 0, 0);

//     constructor(x, y, radius, contRadius, vecAngle, next) {
//         this.x = x;
//         this.y = y;
//         this.radius = radius;
//         this.contRadius = contRadius;
//         this.vecAngle = vecAngle;
//         this.next = next;
//     }

//     static createVert(x, y, radius, contRadius, next) {
//         return new Vertebra(x, y, radius, contRadius, null, next);
//     }

//     draw(ctx) {
//         let dist, cos, sin;
//         ctx.beginPath();
//         if (this.vecAngle === null) {
//             dist = Math.sqrt(Math.pow(this.x - this.next.x, 2) + Math.pow(this.y - this.next.y, 2))
//             cos = Math.abs(this.x - this.next.x) / dist;
//             sin = Math.abs(this.y - this.next.y) / dist;
//         }
//         else {
//             cos = Math.cos(this.vecAngle);
//             sin = Math.sin(this.vecAngle);
//         }
//         if (this.prev == null) {

//             this.curve1.setStart(this.x - 2 * this.radius * cos, this.y - 2 * this.radius * sin);
//             this.curve2.setStart(this.curve1.start.x, this.curve1.start.y);
//         }
//         else {
//             this.curve1.start = this.prev.curve1.end;
//             this.curve2.start = this.prev.curve2.end;
//         }

//         if (this.next == null) {
//             this.curve2.setEnd(this.x + this.radius * sin, this.y - this.radius * cos);
//             this.curve1.setEnd(this.x - this.radius * sin, this.y + this.radius * cos);
//             let distPriv = Math.sqrt(Math.pow(this.x - this.prev.x, 2) + Math.pow(this.y - this.prev.y, 2))
//             this.curve1.setControl(this.curve1.end.x - 0.5 * distPriv * cos, this.curve1.end.y - 0.5 * dist * sin);
//             this.curve2.setControl(this.curve2.end.x - 0.5 * distPriv * cos, this.curve2.end.y - 0.5 * dist * sin);
//             this.drawBezier(ctx)

//         }
//         else {
//             let nextAngle = Math.atan2((this.next.y - this.y), (this.next.x - this.x));
//             this.curve1.setControl(this.x - this.contRadius * this.radius * sin - this.radius * cos, this.y + this.contRadius * this.radius * cos - this.radius * sin);
//             this.curve1.setEnd(this.x - this.radius * Math.sin(nextAngle), this.y + this.radius * Math.cos(nextAngle));
//             this.curve2.setControl(this.x + this.contRadius * this.radius * sin - this.radius * cos, this.y - this.contRadius * this.radius * cos - this.radius * sin);
//             this.curve2.setEnd(this.x + this.radius * Math.sin(nextAngle), this.y - this.radius * Math.cos(nextAngle));
//         }

//         this.curve1.draw(ctx)
//         this.curve2.draw(ctx)
//         ctx.stroke();
//         if (this.next)
//             this.next.draw(ctx);
//     }

//     drawBezier(ctx) {
//         let cos = Math.cos(this.vecAngle);
//         let sin = Math.sin(this.vecAngle);
//         ctx.moveTo(this.curve1.end.x, this.curve1.end.y);
//         ctx.bezierCurveTo(this.curve1.end.x + this.radius * cos, this.curve1.end.y + this.radius * sin, this.curve2.end.x + this.radius * cos, this.curve2.end.y + this.radius * sin, this.curve2.end.x, this.curve2.end.y);
//     }
// }

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

    draw(ctx) {
        ctx.moveTo(this.start.x, this.start.y);
        ctx.bezierCurveTo(this.controlStart.x, this.controlStart.y, this.controlEnd.x, this.controlEnd.y, this.end.x, this.end.y);
    }
}

class Vertebra {
    prev = null;
    curve1 = BezierCurve.createBezier(0, 0, 0, 0, 0, 0, 0, 0);
    curve2 = BezierCurve.createBezier(0, 0, 0, 0, 0, 0, 0, 0);

    constructor(x, y, radius, contRadius, vec, next) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.contRadius = contRadius;
        this.vec = vec;
        this.next = next;
        if (next) {
            this.calcCosSin();
        }
    }

    static createVert(x, y, radius, contRadius, next) {
        return new Vertebra(x, y, radius, contRadius, null, next);
    }

    draw(ctx) {
        ctx.strokeStyle = "rgba(0, 255, 0, 1)";
        ctx.beginPath();


        if (this.prev == null) {

            let tempNext = this.next;

            let nextIsAbove = 1;
            let nextIsToTheRight = 1;
            if (tempNext.y < this.y) {
                nextIsAbove *= -1;
            }
            if (tempNext.x < this.x) {
                nextIsToTheRight *= -1;
            }

            this.curve1.setStart(this.x - 2 * nextIsToTheRight * this.radius * this.cos, this.y - 2 * nextIsAbove * this.radius * this.sin);
            this.curve2.setStart(this.curve1.start.x, this.curve1.start.y);


            this.curve1.setControlStart(this.x - nextIsAbove * this.radius * this.sin, this.y + nextIsToTheRight * this.radius * this.cos);
            this.curve2.setControlStart(this.x + nextIsAbove * this.radius * this.sin, this.y - nextIsToTheRight * this.radius * this.cos);



            this.curve1.setEnd(tempNext.x - nextIsAbove * tempNext.radius * this.sin, tempNext.y + nextIsToTheRight * tempNext.radius * this.cos);
            this.curve2.setEnd(tempNext.x + nextIsAbove * tempNext.radius * this.sin, tempNext.y - nextIsToTheRight * tempNext.radius * this.cos);

            this.curve1.setControlEnd(tempNext.x - nextIsAbove * tempNext.radius * this.sin, tempNext.y + nextIsToTheRight * tempNext.radius * this.cos);
            this.curve2.setControlEnd(tempNext.x + nextIsAbove * tempNext.radius * this.sin, tempNext.y - nextIsToTheRight * tempNext.radius * this.cos);

        }
        else {
            this.curve1.start = this.prev.curve1.end;
            this.curve2.start = this.prev.curve2.end;


            if (this.next == null) {



                let dist = Math.sqrt(Math.pow(this.x - this.vec.x, 2) + Math.pow(this.y - this.vec.y, 2));
                this.cos = Math.abs(this.x - this.vec.x) / dist;
                this.sin = Math.abs(this.y - this.vec.y) / dist;

                let tempPrev = this.prev;

                let prevIsAbove = 1;
                let prevIsToTheRight = 1;
                if (tempPrev.y > this.y) {
                    prevIsAbove *= -1;
                }
                if (tempPrev.x > this.x) {
                    prevIsToTheRight *= -1;
                }

                this.curve1.setControlStart(this.x - prevIsAbove * this.radius * tempPrev.sin + prevIsToTheRight * this.radius * tempPrev.cos, this.y + prevIsToTheRight * this.radius * tempPrev.cos + prevIsAbove * this.radius * tempPrev.sin);
                this.curve2.setControlStart(this.x + prevIsAbove * this.radius * tempPrev.sin + prevIsToTheRight * this.radius * tempPrev.cos, this.y - prevIsToTheRight * this.radius * tempPrev.cos + prevIsAbove * this.radius * tempPrev.sin);


                let tempNext = this.vec;

                let nextIsAbove = 1;
                let nextIsToTheRight = 1;
                if (tempNext.y + this.y < this.y) {
                    nextIsAbove *= -1;
                }
                if (tempNext.x + this.x < this.x) {
                    nextIsToTheRight *= -1;
                }

                this.curve1.setEnd(this.x + prevIsToTheRight * this.radius * this.prev.cos, this.y + prevIsAbove * this.radius * this.prev.sin);
                this.curve2.end = this.curve1.end;

                this.curve1.controlEnd = this.curve1.end;
                this.curve2.controlEnd = this.curve1.end;
            }
            else {

                let tempPrev = this.prev;

                let prevIsAbove = 1;
                let prevIsToTheRight = 1;
                if (tempPrev.y > this.y) {
                    prevIsAbove *= -1;
                }
                if (tempPrev.x > this.x) {
                    prevIsToTheRight *= -1;
                }

                this.curve1.setControlStart(this.x - prevIsAbove * this.radius * tempPrev.sin + prevIsToTheRight * this.radius * tempPrev.cos, this.y + prevIsToTheRight * this.radius * tempPrev.cos + prevIsAbove * this.radius * tempPrev.sin);
                this.curve2.setControlStart(this.x + prevIsAbove * this.radius * tempPrev.sin + prevIsToTheRight * this.radius * tempPrev.cos, this.y - prevIsToTheRight * this.radius * tempPrev.cos + prevIsAbove * this.radius * tempPrev.sin);

                let tempNext = this.next;

                let nextIsAbove = 1;
                let nextIsToTheRight = 1;
                if (tempNext.y < this.y) {
                    nextIsAbove *= -1;
                }
                if (tempNext.x < this.x) {
                    nextIsToTheRight *= -1;
                }

                this.curve1.setEnd(tempNext.x - nextIsAbove * tempNext.radius * this.sin, tempNext.y + nextIsToTheRight * tempNext.radius * this.cos);
                this.curve2.setEnd(tempNext.x + nextIsAbove * tempNext.radius * this.sin, tempNext.y - nextIsToTheRight * tempNext.radius * this.cos);

                this.curve1.setControlEnd(tempNext.x - nextIsAbove * tempNext.radius * this.sin, tempNext.y + nextIsToTheRight * tempNext.radius * this.cos);
                this.curve2.setControlEnd(tempNext.x + nextIsAbove * tempNext.radius * this.sin, tempNext.y - nextIsToTheRight * tempNext.radius * this.cos);
            }
        }
        ctx.strokeStyle = "rgba(0, 255, 0, 1)";
        this.curve1.draw(ctx)
        this.curve2.draw(ctx)
        ctx.stroke();

        if (this.next) {
            // this.devGraphics(ctx);
            this.next.draw(ctx);
        }
    }

    devGraphics(ctx) {

        ctx.strokeStyle = "rgba(255, 0, 0, 1)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();


        let tempNext = this.next;

        let nextIsAbove = 1;
        let nextIsToTheRight = 1;
        if (tempNext.y < this.y) {
            nextIsAbove *= -1;
        }
        if (tempNext.x < this.x) {
            nextIsToTheRight *= -1;
        }

        ctx.strokeStyle = "rgba(255, 0, 0, 1)";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.next.x, this.next.y);
        ctx.stroke();

        if (this.prev) {
            let tempPrev = this.prev;

            let prevIsAbove = 1;
            let prevIsToTheRight = 1;
            if (tempPrev.y > this.y) {
                prevIsAbove *= -1;
            }
            if (tempPrev.x > this.x) {
                prevIsToTheRight *= -1;
            }

            // ctx.beginPath();
            // ctx.arc(this.x - prevIsAbove * this.radius * tempPrev.sin + prevIsToTheRight * this.radius * tempPrev.cos, this.y + prevIsToTheRight *this.radius * tempPrev.cos + prevIsAbove * this.radius * tempPrev.sin, 5, 0, 2 * Math.PI);
            // ctx.stroke();

            // ctx.beginPath();
            // ctx.arc(this.x + prevIsAbove * this.radius * tempPrev.sin + prevIsToTheRight * this.radius * tempPrev.cos, this.y - prevIsToTheRight *this.radius * tempPrev.cos + prevIsAbove * this.radius * tempPrev.sin, 5, 0, 2 * Math.PI);
            // ctx.stroke();

        }

    }

    calcCosSin() {
        let dist = Math.sqrt(Math.pow(this.x - this.next.x, 2) + Math.pow(this.y - this.next.y, 2));
        this.cos = Math.abs(this.x - this.next.x) / dist;
        this.sin = Math.abs(this.y - this.next.y) / dist;
    }


    move() {
        //intensity of change
        let num = 0.1;

        let type = getRndInteger(1, 3);

        let positive, magnitude, newVec;


        switch (type) {
            //change x of movement vector
            case 1:
                //0 = decrease, 1 = increase
                positive = getRndInteger(0, 1);
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
                positive = getRndInteger(0, 1);
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
    }



    anglePrev() {
        return Math.atan2((this.y - this.prev.y), (this.x - this.prev.x)) * 180 / Math.PI;
    }

    angleOfVec(vec) {
        return Math.atan2(vec.y, vec.x) * 180 / Math.PI;
    }



    changePrev(dist) {
        if (this.prev) {

            let tempPrev = this.prev;

            let prevIsAbove = 1;
            let prevIsToTheRight = 1;
            if (tempPrev.y > this.y) {
                prevIsAbove *= -1;
            }
            if (tempPrev.x > this.x) {
                prevIsToTheRight *= -1;
            }
            let fairDist = 1;
            let distToPrev = Math.sqrt(Math.pow(this.x - this.prev.x, 2) + Math.pow(this.y - this.prev.y, 2));

            if (distToPrev < this.radius * 3) {
                if (distToPrev < this.radius * 2.5) {
                    console.log('here');
                    return;
                }
                fairDist / 4;
            }
            this.prev.x += prevIsToTheRight * this.prev.cos * dist * fairDist;
            this.prev.y += prevIsAbove * this.prev.sin * dist * fairDist;
            this.prev.calcCosSin();
            this.prev.changePrev(dist);
        }
    }
}

class Wisp {

    constructor() {
        //     this.vert4 = new Vertebra(200, 500, 40, 0.95, new Vector(-0.5, 0), null);
        //     this.vert3 = Vertebra.createVert(268, 500, 34, 0.95, this.vert4);
        //     this.vert4.prev = this.vert3;
        //     this.vert2 = Vertebra.createVert(342, 500, 28, 0.95, this.vert3);
        //     this.vert3.prev = this.vert2;
        //     this.vert1 = Vertebra.createVert(450, 500, 24, 0.95, this.vert2);
        //     this.vert2.prev = this.vert1;
        //     this.vert0 = Vertebra.createVert(500, 500, 20, 0.95, this.vert1);
        //     this.vert1.prev = this.vert0;

        this.vert4 = new Vertebra(550, 500, 31, 0.95, new Vector(0.5, 0), null);
        this.vert3 = Vertebra.createVert(450, 500, 26, 0.95, this.vert4);
        this.vert4.prev = this.vert3;
        this.vert2 = Vertebra.createVert(342, 500, 22, 0.95, this.vert3);
        this.vert3.prev = this.vert2;
        this.vert1 = Vertebra.createVert(268, 500, 18, 0.95, this.vert2);
        this.vert2.prev = this.vert1;
        this.vert0 = Vertebra.createVert(200, 500, 15, 0.95, this.vert1);
        this.vert1.prev = this.vert0;
        this.vertsArr = [];
        this.vertsArr.push(this.vert0, this.vert1, this.vert2, this.vert3, this.vert4);

        //variable for move edge function, used for clearing setInterval after a certain period of time
        this.moveEdgeTimer = 0;

        this.movingFromEdge = false;

        this.vertsArr[this.vertsArr.length - 1].dirRight = false;

        setInterval(() => {
            this.vertsArr[this.vertsArr.length - 1].dirRight = !this.vertsArr[this.vertsArr.length - 1].dirRight;
        }, CHANGE_DIR_TIMER)
    }

    draw(ctx) {
        this.vertsArr[0].draw(ctx);
    }

    move() {
        this.vertsArr[this.vertsArr.length - 1].move();
    }

    moveWispByDots(dx, dy, vert, ctx) {
        vert.x += dx;
        vert.y += dy;

        if (vert.prev) {
            this.moveWispByDots(dx, dy, vert.prev, ctx);
        }
        else {
            this.draw(ctx);
        }
    }

    moveIfNearEdge(ctx) {
        /*-----------------------------------MAKE THE POS CHANGE OF THE WISP GRADUAL YOU PIECE OF SHIT--------------------------------
                ----------------------------------------------------------------------------------------------------------------------
                ----------------------------------------------------------------------------------------------------------------------
                ----------------------------------------------------------------------------------------------------------------------
                ----------------------------------------------------------------------------------------------------------------------
                ----------------------------------------------------------------------------------------------------------------------
                ----------------------------------------------------------------------------------------------------------------------
                ----------------------------------------------------------------------------------------------------------------------
                ----------------------------------------------------------------------------------------------------------------------
                ---------------------------------------------------------------------------------------------------------------------*/
        let dist;

        //right edge of screen
        if (this.vertsArr[this.vertsArr.length - 1].x >= ctx.canvas.width) {
            this.movingFromEdge = true;
            this.interval = setInterval(() => {
                dist = ctx.canvas.width / 1.5 / MOVE_FROM_EDGE_TIME * 10;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.moveWispByDots(-1 * dist, 0, this.vertsArr[this.vertsArr.length - 1], ctx)
                this.moveEdgeTimer += 10;
                if (this.moveEdgeTimer == MOVE_FROM_EDGE_TIME) {
                    this.moveEdgeTimer = 0;
                    this.movingFromEdge = false;
                    clearInterval(this.interval);
                }
            }, 10);
        }
        //left edge of screen
        if (this.vertsArr[this.vertsArr.length - 1].x <= 0) {
            this.movingFromEdge = true;
            this.interval = setInterval(() => {
                dist = ctx.canvas.width / 1.5 / MOVE_FROM_EDGE_TIME * 10;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.moveWispByDots(dist, 0, this.vertsArr[this.vertsArr.length - 1], ctx)
                this.moveEdgeTimer += 10;
                if (this.moveEdgeTimer == MOVE_FROM_EDGE_TIME) {
                    this.moveEdgeTimer = 0;
                    this.movingFromEdge = false;
                    clearInterval(this.interval);
                }
            }, 10);
        }
        //top bottom edge of screen
        if (this.vertsArr[this.vertsArr.length - 1].y >= ctx.canvas.height) {
            this.movingFromEdge = true;
            this.interval = setInterval(() => {
                dist = ctx.canvas.height / 1.5 / MOVE_FROM_EDGE_TIME * 10;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.moveWispByDots(0, -1 * dist, this.vertsArr[this.vertsArr.length - 1], ctx)
                this.moveEdgeTimer += 10;
                if (this.moveEdgeTimer == MOVE_FROM_EDGE_TIME) {
                    this.moveEdgeTimer = 0;
                    this.movingFromEdge = false;
                    clearInterval(this.interval);
                }
            }, 10);
        }
        //bottom edge of screen
        if (this.vertsArr[this.vertsArr.length - 1].y <= 0) {
            this.movingFromEdge = true;
            this.interval = setInterval(() => {
                dist = ctx.canvas.height / 1.5 / MOVE_FROM_EDGE_TIME * 10;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.moveWispByDots(0, dist, this.vertsArr[this.vertsArr.length - 1], ctx)
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

wisp = new Wisp();
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.strokeStyle = "rgba(255, 255, 0, 1)";
wisp.draw(ctx);


$(window).on('resize', function () {
    var win = $(this); //this = window
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
});

setInterval(() => {
    if (!wisp.movingFromEdge) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        wisp.move();

        wisp.moveIfNearEdge(ctx);

        wisp.draw(ctx);
    }
}, 10);


