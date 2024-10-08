import { Line } from './line.js';
import { Plane } from './plane.js';
import { Vector } from './vector.js';

export class LineSegment {
  constructor(v1, v2) {
    this.setPoints(v1, v2);
  }

  eql(segment) {
    return (
      (this.start.eql(segment.start) && this.end.eql(segment.end)) ||
      (this.start.eql(segment.end) && this.end.eql(segment.start))
    );
  }

  dup() {
    return new LineSegment(this.start, this.end);
  }

  length() {
    let A = this.start.elements,
      B = this.end.elements;
    let C1 = B[0] - A[0],
      C2 = B[1] - A[1],
      C3 = B[2] - A[2];
    return Math.sqrt(C1 * C1 + C2 * C2 + C3 * C3);
  }

  toVector() {
    let A = this.start.elements,
      B = this.end.elements;
    return new Vector([B[0] - A[0], B[1] - A[1], B[2] - A[2]]);
  }

  midpoint() {
    let A = this.start.elements,
      B = this.end.elements;
    return new Vector([(B[0] + A[0]) / 2, (B[1] + A[1]) / 2, (B[2] + A[2]) / 2]);
  }

  bisectingPlane() {
    return new Plane(this.midpoint(), this.toVector());
  }

  translate(vector) {
    let V = vector.elements || vector;
    let S = this.start.elements,
      E = this.end.elements;
    return new LineSegment(
      [S[0] + V[0], S[1] + V[1], S[2] + (V[2] || 0)],
      [E[0] + V[0], E[1] + V[1], E[2] + (V[2] || 0)],
    );
  }

  isParallelTo(obj) {
    return this.line.isParallelTo(obj);
  }

  distanceFrom(obj) {
    let P = this.pointClosestTo(obj);
    return P === null ? null : P.distanceFrom(obj);
  }

  contains(obj) {
    if (obj.start && obj.end) {
      return this.contains(obj.start) && this.contains(obj.end);
    }
    let P = (obj.elements || obj).slice();
    if (P.length === 2) {
      P.push(0);
    }
    if (this.start.eql(P)) {
      return true;
    }
    let S = this.start.elements;
    let V = new Vector([S[0] - P[0], S[1] - P[1], S[2] - (P[2] || 0)]);
    let vect = this.toVector();
    return V.isAntiparallelTo(vect) && V.modulus() <= vect.modulus();
  }

  intersects(obj) {
    return this.intersectionWith(obj) !== null;
  }

  intersectionWith(obj) {
    if (!this.line.intersects(obj)) {
      return null;
    }
    let P = this.line.intersectionWith(obj);
    return this.contains(P) ? P : null;
  }

  pointClosestTo(obj) {
    if (obj.normal) {
      // obj is a plane
      let V = this.line.intersectionWith(obj);
      if (V === null) {
        return null;
      }
      return this.pointClosestTo(V);
    } else {
      // obj is a line (segment) or point
      let P = this.line.pointClosestTo(obj);
      if (P === null) {
        return null;
      }
      if (this.contains(P)) {
        return P;
      }
      return (this.line.positionOf(P) < 0 ? this.start : this.end).dup();
    }
  }

  setPoints(startPoint, endPoint) {
    startPoint = new Vector(startPoint).to3D();
    endPoint = new Vector(endPoint).to3D();
    if (startPoint === null || endPoint === null) {
      return null;
    }
    this.line = new Line(startPoint, endPoint.subtract(startPoint));
    this.start = startPoint;
    this.end = endPoint;
    return this;
  }
}
