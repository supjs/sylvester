import { Line } from './line.js';
import { Matrix } from './matrix.js';
import { getPrecision } from './precision.js';
import { Vector } from './vector.js';

export class Plane {
  constructor(anchor, v1, v2) {
    this.setVectors(anchor, v1, v2);
  }

  static XY = new Plane(Vector.Zero(3), Vector.k);
  static YZ = new Plane(Vector.Zero(3), Vector.i);
  static ZX = new Plane(Vector.Zero(3), Vector.j);
  static YX = Plane.XY;
  static ZY = Plane.YZ;
  static XZ = Plane.ZX;

  static fromPoints(points) {
    let np = points.length,
      list = [],
      i,
      P,
      n,
      N,
      A,
      B,
      C,
      D,
      theta,
      prevN,
      totalN = Vector.Zero(3);
    for (i = 0; i < np; i++) {
      P = new Vector(points[i]).to3D();
      if (P === null) {
        return null;
      }
      list.push(P);
      n = list.length;
      if (n > 2) {
        // Compute plane normal for the latest three points
        A = list[n - 1].elements;
        B = list[n - 2].elements;
        C = list[n - 3].elements;
        N = new Vector([
          (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
          (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
          (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0]),
        ]).toUnitVector();
        if (n > 3) {
          // If the latest normal is not (anti)parallel to the previous one, we've
          // strayed off the plane. This might be a slightly long-winded way of
          // doing things, but we need the sum of all the normals to find which
          // way the plane normal should point so that the points form an
          // anticlockwise list.
          theta = N.angleFrom(prevN);
          if (theta !== null) {
            if (
              !(Math.abs(theta) <= getPrecision() || Math.abs(theta - Math.PI) <= getPrecision())
            ) {
              return null;
            }
          }
        }
        totalN = totalN.add(N);
        prevN = N;
      }
    }
    // We need to add in the normals at the start and end points, which the above
    // misses out
    A = list[1].elements;
    B = list[0].elements;
    C = list[n - 1].elements;
    D = list[n - 2].elements;
    totalN = totalN
      .add(
        new Vector([
          (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
          (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
          (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0]),
        ]).toUnitVector(),
      )
      .add(
        new Vector([
          (B[1] - C[1]) * (D[2] - C[2]) - (B[2] - C[2]) * (D[1] - C[1]),
          (B[2] - C[2]) * (D[0] - C[0]) - (B[0] - C[0]) * (D[2] - C[2]),
          (B[0] - C[0]) * (D[1] - C[1]) - (B[1] - C[1]) * (D[0] - C[0]),
        ]).toUnitVector(),
      );
    return new Plane(list[0], totalN);
  }

  eql(plane) {
    return this.contains(plane.anchor) && this.isParallelTo(plane);
  }

  dup() {
    return new Plane(this.anchor, this.normal);
  }

  translate(vector) {
    let V = vector.elements || vector;
    return new Plane(
      [
        this.anchor.elements[0] + V[0],
        this.anchor.elements[1] + V[1],
        this.anchor.elements[2] + (V[2] || 0),
      ],
      this.normal,
    );
  }

  isParallelTo(obj) {
    let theta;
    if (obj.normal) {
      // obj is a plane
      theta = this.normal.angleFrom(obj.normal);
      return Math.abs(theta) <= getPrecision() || Math.abs(Math.PI - theta) <= getPrecision();
    } else if (obj.direction) {
      // obj is a line
      return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
  }

  isPerpendicularTo(plane) {
    let theta = this.normal.angleFrom(plane.normal);
    return Math.abs(Math.PI / 2 - theta) <= getPrecision();
  }

  distanceFrom(obj) {
    if (this.intersects(obj) || this.contains(obj)) {
      return 0;
    }
    if (obj.anchor) {
      // obj is a plane or line
      let A = this.anchor.elements,
        B = obj.anchor.elements,
        N = this.normal.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      let P = obj.elements || obj;
      let A = this.anchor.elements,
        N = this.normal.elements;
      return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
    }
  }

  contains(obj) {
    if (obj.normal) {
      return null;
    }
    if (obj.direction) {
      return this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction));
    } else {
      let P = obj.elements || obj;
      let A = this.anchor.elements,
        N = this.normal.elements;
      let diff = Math.abs(
        N[0] * (A[0] - P[0]) + N[1] * (A[1] - P[1]) + N[2] * (A[2] - (P[2] || 0)),
      );
      return diff <= getPrecision();
    }
  }

  intersects(obj) {
    if (typeof obj.direction === 'undefined' && typeof obj.normal === 'undefined') {
      return null;
    }
    return !this.isParallelTo(obj);
  }

  intersectionWith(obj) {
    if (!this.intersects(obj)) {
      return null;
    }
    if (obj.direction) {
      // obj is a line
      let A = obj.anchor.elements,
        D = obj.direction.elements,
        P = this.anchor.elements,
        N = this.normal.elements;
      let multiplier =
        (N[0] * (P[0] - A[0]) + N[1] * (P[1] - A[1]) + N[2] * (P[2] - A[2])) /
        (N[0] * D[0] + N[1] * D[1] + N[2] * D[2]);
      return new Vector([
        A[0] + D[0] * multiplier,
        A[1] + D[1] * multiplier,
        A[2] + D[2] * multiplier,
      ]);
    } else if (obj.normal) {
      // obj is a plane
      let direction = this.normal.cross(obj.normal).toUnitVector();
      // To find an anchor point, we find one co-ordinate that has a value of
      // zero somewhere on the intersection, and remember which one we picked
      let N = this.normal.elements,
        A = this.anchor.elements,
        O = obj.normal.elements,
        B = obj.anchor.elements;
      let solver = Matrix.Zero(2, 2),
        i = 0;
      while (solver.isSingular()) {
        i++;
        solver = new Matrix([
          [N[i % 3], N[(i + 1) % 3]],
          [O[i % 3], O[(i + 1) % 3]],
        ]);
      }
      // Then we solve the simultaneous equations in the remaining dimensions
      let inverse = solver.inverse().elements;
      let x = N[0] * A[0] + N[1] * A[1] + N[2] * A[2];
      let y = O[0] * B[0] + O[1] * B[1] + O[2] * B[2];
      let intersection = [
        inverse[0][0] * x + inverse[0][1] * y,
        inverse[1][0] * x + inverse[1][1] * y,
      ];
      let anchor = [];
      for (let j = 1; j <= 3; j++) {
        // This formula picks the right element from intersection by cycling
        // depending on which element we set to zero above
        anchor.push(i === j ? 0 : intersection[(j + ((5 - i) % 3)) % 3]);
      }
      return new Line(anchor, direction);
    }
  }

  pointClosestTo(point) {
    let P = point.elements || point;
    let A = this.anchor.elements,
      N = this.normal.elements;
    let dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
    return new Vector([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
  }

  rotate(t, line) {
    let R = t.determinant ? t.elements : Matrix.Rotation(t, line.direction).elements;
    let C = line.pointClosestTo(this.anchor).elements;
    let A = this.anchor.elements,
      N = this.normal.elements;
    let C1 = C[0],
      C2 = C[1],
      C3 = C[2],
      A1 = A[0],
      A2 = A[1],
      A3 = A[2];
    let x = A1 - C1,
      y = A2 - C2,
      z = A3 - C3;
    return new Plane(
      [
        C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
        C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
        C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z,
      ],
      [
        R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
        R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
        R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2],
      ],
    );
  }

  reflectionIn(obj) {
    if (obj.normal) {
      // obj is a plane
      let A = this.anchor.elements,
        N = this.normal.elements;
      let A1 = A[0],
        A2 = A[1],
        A3 = A[2],
        N1 = N[0],
        N2 = N[1],
        N3 = N[2];
      let newA = this.anchor.reflectionIn(obj).elements;
      // Add the plane's normal to its anchor, then mirror that in the other plane
      let AN1 = A1 + N1,
        AN2 = A2 + N2,
        AN3 = A3 + N3;
      let Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
      let newN = [
        Q[0] + (Q[0] - AN1) - newA[0],
        Q[1] + (Q[1] - AN2) - newA[1],
        Q[2] + (Q[2] - AN3) - newA[2],
      ];
      return new Plane(newA, newN);
    } else if (obj.direction) {
      // obj is a line
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point
      let P = obj.elements || obj;
      return new Plane(this.anchor.reflectionIn([P[0], P[1], P[2] || 0]), this.normal);
    }
  }

  setVectors(anchor, v1, v2) {
    anchor = new Vector(anchor);
    anchor = anchor.to3D();
    if (anchor === null) {
      return null;
    }
    v1 = new Vector(v1);
    v1 = v1.to3D();
    if (v1 === null) {
      return null;
    }
    if (typeof v2 === 'undefined') {
      v2 = null;
    } else {
      v2 = new Vector(v2);
      v2 = v2.to3D();
      if (v2 === null) {
        return null;
      }
    }
    let A1 = anchor.elements[0],
      A2 = anchor.elements[1],
      A3 = anchor.elements[2];
    let v11 = v1.elements[0],
      v12 = v1.elements[1],
      v13 = v1.elements[2];
    let normal, mod;
    if (v2 !== null) {
      let v21 = v2.elements[0],
        v22 = v2.elements[1],
        v23 = v2.elements[2];
      normal = new Vector([
        (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
        (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
        (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1),
      ]);
      mod = normal.modulus();
      if (mod === 0) {
        return null;
      }
      normal = new Vector([
        normal.elements[0] / mod,
        normal.elements[1] / mod,
        normal.elements[2] / mod,
      ]);
    } else {
      mod = Math.sqrt(v11 * v11 + v12 * v12 + v13 * v13);
      if (mod === 0) {
        return null;
      }
      normal = new Vector([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
  }
}
