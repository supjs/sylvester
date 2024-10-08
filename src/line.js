import { Matrix } from './matrix.js';
import { Plane } from './plane.js';
import { Sylvester } from './sylvester.js';
import { Vector } from './vector.js';

export class Line {
  static X = new Line(Vector.Zero(3), Vector.i);
  static Y = new Line(Vector.Zero(3), Vector.j);
  static Z = new Line(Vector.Zero(3), Vector.k);

  constructor(anchor, direction) {
    this.setVectors(anchor, direction);
  }

  eql(line) {
    return this.isParallelTo(line) && this.contains(line.anchor);
  }

  dup() {
    return new Line(this.anchor, this.direction);
  }

  translate(vector) {
    let V = vector.elements || vector;
    return new Line(
      [
        this.anchor.elements[0] + V[0],
        this.anchor.elements[1] + V[1],
        this.anchor.elements[2] + (V[2] || 0),
      ],
      this.direction,
    );
  }

  isParallelTo(obj) {
    if (obj.normal || (obj.start && obj.end)) {
      return obj.isParallelTo(this);
    }
    let theta = this.direction.angleFrom(obj.direction);
    return (
      Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision
    );
  }

  distanceFrom(obj) {
    if (obj.normal || (obj.start && obj.end)) {
      return obj.distanceFrom(this);
    }
    if (obj.direction) {
      // obj is a line
      if (this.isParallelTo(obj)) {
        return this.distanceFrom(obj.anchor);
      }
      let N = this.direction.cross(obj.direction).toUnitVector().elements;
      let A = this.anchor.elements,
        B = obj.anchor.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      let P = obj.elements || obj;
      let A = this.anchor.elements,
        D = this.direction.elements;
      let PA1 = P[0] - A[0],
        PA2 = P[1] - A[1],
        PA3 = (P[2] || 0) - A[2];
      let modPA = Math.sqrt(PA1 * PA1 + PA2 * PA2 + PA3 * PA3);
      if (modPA === 0) return 0;
      // Assumes direction vector is normalized
      let cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
      let sin2 = 1 - cosTheta * cosTheta;
      return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
    }
  }

  contains(obj) {
    if (obj.start && obj.end) {
      return this.contains(obj.start) && this.contains(obj.end);
    }
    let dist = this.distanceFrom(obj);
    return dist !== null && dist <= Sylvester.precision;
  }

  positionOf(point) {
    if (!this.contains(point)) {
      return null;
    }
    let P = point.elements || point;
    let A = this.anchor.elements,
      D = this.direction.elements;
    return (P[0] - A[0]) * D[0] + (P[1] - A[1]) * D[1] + ((P[2] || 0) - A[2]) * D[2];
  }

  liesIn(plane) {
    return plane.contains(this);
  }

  intersects(obj) {
    if (obj.normal) {
      return obj.intersects(this);
    }
    return !this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision;
  }

  intersectionWith(obj) {
    if (obj.normal || (obj.start && obj.end)) {
      return obj.intersectionWith(this);
    }
    if (!this.intersects(obj)) {
      return null;
    }
    let P = this.anchor.elements,
      X = this.direction.elements,
      Q = obj.anchor.elements,
      Y = obj.direction.elements;
    let X1 = X[0],
      X2 = X[1],
      X3 = X[2],
      Y1 = Y[0],
      Y2 = Y[1],
      Y3 = Y[2];
    let PsubQ1 = P[0] - Q[0],
      PsubQ2 = P[1] - Q[1],
      PsubQ3 = P[2] - Q[2];
    let XdotQsubP = -X1 * PsubQ1 - X2 * PsubQ2 - X3 * PsubQ3;
    let YdotPsubQ = Y1 * PsubQ1 + Y2 * PsubQ2 + Y3 * PsubQ3;
    let XdotX = X1 * X1 + X2 * X2 + X3 * X3;
    let YdotY = Y1 * Y1 + Y2 * Y2 + Y3 * Y3;
    let XdotY = X1 * Y1 + X2 * Y2 + X3 * Y3;
    let k = ((XdotQsubP * YdotY) / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
    return new Vector([P[0] + k * X1, P[1] + k * X2, P[2] + k * X3]);
  }

  pointClosestTo(obj) {
    if (obj.start && obj.end) {
      // obj is a line segment
      let P = obj.pointClosestTo(this);
      return P === null ? null : this.pointClosestTo(P);
    } else if (obj.direction) {
      // obj is a line
      if (this.intersects(obj)) {
        return this.intersectionWith(obj);
      }
      if (this.isParallelTo(obj)) {
        return null;
      }
      let D = this.direction.elements,
        E = obj.direction.elements;
      let D1 = D[0],
        D2 = D[1],
        D3 = D[2],
        E1 = E[0],
        E2 = E[1],
        E3 = E[2];
      // Create plane containing obj and the shared normal and intersect this
      // with it Thank you:
      // http://www.cgafaq.info/wiki/Sylvester.Line-line_distance
      let x = D3 * E1 - D1 * E3,
        y = D1 * E2 - D2 * E1,
        z = D2 * E3 - D3 * E2;
      let N = [x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1];
      let P = new Plane(obj.anchor, N);
      return P.intersectionWith(this);
    } else {
      // obj is a point
      let P = obj.elements || obj;
      if (this.contains(P)) {
        return new Vector(P);
      }
      let A = this.anchor.elements,
        D = this.direction.elements;
      let D1 = D[0],
        D2 = D[1],
        D3 = D[2],
        A1 = A[0],
        A2 = A[1],
        A3 = A[2];
      let x = D1 * (P[1] - A2) - D2 * (P[0] - A1),
        y = D2 * ((P[2] || 0) - A3) - D3 * (P[1] - A2),
        z = D3 * (P[0] - A1) - D1 * ((P[2] || 0) - A3);
      let V = new Vector([D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y]);
      let k = this.distanceFrom(P) / V.modulus();
      return new Vector([
        P[0] + V.elements[0] * k,
        P[1] + V.elements[1] * k,
        (P[2] || 0) + V.elements[2] * k,
      ]);
    }
  }

  // Returns a copy of the line rotated by t radians about the given line. Works
  // by finding the argument's closest point to this line's anchor point (call
  // this C) and rotating the anchor about C. Also rotates the line's direction
  // about the argument's. Be careful with this - the rotation axis' direction
  // affects the outcome!
  rotate(t, line) {
    // If we're working in 2D
    if (typeof line.direction === 'undefined') {
      line = new Line(line.to3D(), Vector.k);
    }
    let R = Matrix.Rotation(t, line.direction).elements;
    let C = line.pointClosestTo(this.anchor).elements;
    let A = this.anchor.elements,
      D = this.direction.elements;
    let C1 = C[0],
      C2 = C[1],
      C3 = C[2],
      A1 = A[0],
      A2 = A[1],
      A3 = A[2];
    let x = A1 - C1,
      y = A2 - C2,
      z = A3 - C3;
    return new Line(
      [
        C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
        C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
        C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z,
      ],
      [
        R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2],
        R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2],
        R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2],
      ],
    );
  }

  reverse() {
    return new Line(this.anchor, this.direction.x(-1));
  }

  reflectionIn(obj) {
    if (obj.normal) {
      // obj is a plane
      let A = this.anchor.elements,
        D = this.direction.elements;
      let A1 = A[0],
        A2 = A[1],
        A3 = A[2],
        D1 = D[0],
        D2 = D[1],
        D3 = D[2];
      let newA = this.anchor.reflectionIn(obj).elements;
      // Add the line's direction vector to its anchor, then mirror that in the plane
      let AD1 = A1 + D1,
        AD2 = A2 + D2,
        AD3 = A3 + D3;
      let Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
      let newD = [
        Q[0] + (Q[0] - AD1) - newA[0],
        Q[1] + (Q[1] - AD2) - newA[1],
        Q[2] + (Q[2] - AD3) - newA[2],
      ];
      return new Line(newA, newD);
    } else if (obj.direction) {
      // obj is a line - reflection obtained by rotating PI radians about obj
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point - just reflect the line's anchor in it
      let P = obj.elements || obj;
      return new Line(this.anchor.reflectionIn([P[0], P[1], P[2] || 0]), this.direction);
    }
  }

  setVectors(anchor, direction) {
    // Need to do this so that line's properties are not references to the
    // arguments passed in
    anchor = new Vector(anchor);
    direction = new Vector(direction);
    if (anchor.elements.length === 2) {
      anchor.elements.push(0);
    }
    if (direction.elements.length === 2) {
      direction.elements.push(0);
    }
    if (anchor.elements.length > 3 || direction.elements.length > 3) {
      return null;
    }
    let mod = direction.modulus();
    if (mod === 0) {
      return null;
    }
    this.anchor = anchor;
    this.direction = new Vector([
      direction.elements[0] / mod,
      direction.elements[1] / mod,
      direction.elements[2] / mod,
    ]);
    return this;
  }
}
