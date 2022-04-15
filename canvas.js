class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class QuadeCurve {
    constructor(start, end, control) {
        this.start = start;
        this.end = end
        this.control = control
    }

    static const(xs, ys, xe, ye, xc, yc) {
        return new QuadeCurve(new Vector(xs, ys), new Vector(xe, ye), new Vector(xc, yc));
    }

    draw(ctx) {
        ctx.moveTo(this.start.x, this.start.y)
        ctx.quadraticCurveTo(this.control.x, this.control.y, this.end.x, this.end.y)
    }
}

curve1 = QuadeCurve.const(0, 0, 300, 100, 200, 200)
curve2 = QuadeCurve.const(300, 100, 0, 0, 250, 330)

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.beginPath();
curve1.draw(ctx);
curve2.draw(ctx);
ctx.strokeStyle = "rgba(255, 255, 0, 1)";
ctx.stroke();