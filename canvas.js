class Vector {
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

class Vertebra {
    prev = null;
    curve1 = QuadeCurve.constr(0, 0, 0, 0, 0, 0);
    curve2 = QuadeCurve.constr(0, 0, 0, 0, 0, 0);

    constructor(x, y, radius, contRadius, vecAngle, next) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.contRadius = contRadius;
        this.vecAngle = vecAngle;
        this.next = next;
    }

    draw(ctx) {
        ctx.beginPath();
        let cos = Math.cos(this.vecAngle);
        let sin = Math.sin(this.vecAngle);
        if (this.prev == null) {

            this.curve1.setStart(this.x - 2 * this.radius * cos, this.y - 2 * this.radius * sin);
            this.curve2.setStart(this.curve1.start.x, this.curve1.start.y);
        }
        else {
            this.curve1.start = this.prev.curve1.end;
            this.curve2.start = this.prev.curve2.end;
        }

        if (this.next == null) {
            this.curve2.setEnd(this.x + this.radius * sin, this.y - this.radius * cos);
            this.curve1.setEnd(this.x - this.radius * sin, this.y + this.radius * cos);
            let dist = Math.sqrt(Math.pow(this.x - this.prev.x, 2) + Math.pow(this.y - this.prev.y, 2))
            this.curve1.setControl(this.curve1.end.x - 0.5 * dist * cos, this.curve1.end.y - 0.5 * dist * sin);
            this.curve2.setControl(this.curve2.end.x - 0.5 * dist * cos, this.curve2.end.y - 0.5 * dist * sin);
            this.drawBezier(ctx)

        }
        else {
            let nextAngle = Math.atan2((this.next.y - this.y), (this.next.x - this.x));
            this.curve1.setControl(this.x - this.contRadius * this.radius * sin - this.radius * cos, this.y + this.contRadius * this.radius * cos - this.radius * sin);
            this.curve1.setEnd(this.x - this.radius * Math.sin(nextAngle), this.y + this.radius * Math.cos(nextAngle));
            this.curve2.setControl(this.x + this.contRadius * this.radius * sin - this.radius * cos, this.y - this.contRadius * this.radius * cos - this.radius * sin);
            this.curve2.setEnd(this.x + this.radius * Math.sin(nextAngle), this.y - this.radius * Math.cos(nextAngle));
        }

        this.curve1.draw(ctx)
        this.curve2.draw(ctx)
        ctx.stroke();
        if (this.next)
            this.next.draw(ctx);
    }

    drawBezier(ctx) {
        let cos = Math.cos(this.vecAngle);
        let sin = Math.sin(this.vecAngle);
        ctx.moveTo(this.curve1.end.x, this.curve1.end.y);
        ctx.bezierCurveTo(this.curve1.end.x + this.radius * cos, this.curve1.end.y + this.radius * sin, this.curve2.end.x + this.radius * cos, this.curve2.end.y + this.radius * sin, this.curve2.end.x, this.curve2.end.y);
    }
}

class Wisp {
    constructor() {
        this.vert4 = new Vertebra(326, 500, 20, 0, null);
        this.vert3 = new Vertebra(286, 500, 17, 0.87, 0, this.vert4);
        this.vert4.prev = this.vert3;
        this.vert2 = new Vertebra(252, 500, 14, 0.84, 0, this.vert3);
        this.vert3.prev = this.vert2;
        this.vert1 = new Vertebra(224, 500, 12, 0.8, 0, this.vert2);
        this.vert2.prev = this.vert1;
        console.log(this.vert1);
        this.vert0 = new Vertebra(200, 500, 10, 0.55, 0, this.vert1);
        this.vert1.prev = this.vert0;
    }

    draw(ctx){
        console.log(this.vert0.next);
        this.vert0.draw(ctx);
    }
}

wisp = new Wisp();
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.strokeStyle = "rgba(255, 255, 0, 1)";
// ctx.beginPath();
wisp.draw(ctx);
// ctx.stroke();
// ctx.beginPath();
// ctx.strokeStyle = "rgba(0, 255, 0, 1)";
// vert1.draw(ctx);
// ctx.stroke();
// ctx.beginPath();
// ctx.strokeStyle = "rgba(0, 255, 255, 1)";
// vert2.draw(ctx);
// ctx.stroke();

$(window).on('resize', function () {
    var win = $(this); //this = window
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
});