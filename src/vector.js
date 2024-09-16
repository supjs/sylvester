import { Matrix } from './matrix.js';
import { Sylvester } from './sylvester.js';

export class Vector {
  static Random(n) {
    let elements = [];
    while (n--) {
      elements.push(Math.random());
    }
    return new Vector(elements);
  }

  static Zero(n) {
    let elements = [];
    while (n--) {
      elements.push(0);
    }
    return new Vector(elements);
  }

  static i = new Vector([1, 0, 0]);
  static j = new Vector([0, 1, 0]);
  static k = new Vector([0, 0, 1]);

  constructor(elements) {
    this.setElements(elements);
  }

  e(i) {
    return i < 1 || i > this.elements.length ? null : this.elements[i - 1];
  }

  dimensions() {
    return this.elements.length;
  }

  modulus() {
    return Math.sqrt(this.dot(this));
  }

  eql(vector) {
    let n = this.elements.length;
    let V = vector.elements || vector;
    if (n !== V.length) {
      return false;
    }
    while (n--) {
      if (Math.abs(this.elements[n] - V[n]) > Sylvester.precision) {
        return false;
      }
    }
    return true;
  }

  dup() {
    return new Vector(this.elements);
  }

  map(fn, context) {
    let elements = [];
    this.each(function (x, i) {
      elements.push(fn.call(context, x, i));
    });
    return new Vector(elements);
  }

  forEach(fn, context = undefined) {
    let n = this.elements.length;
    for (let i = 0; i < n; i++) {
      fn.call(context, this.elements[i], i + 1);
    }
  }

  toUnitVector() {
    let r = this.modulus();
    if (r === 0) {
      return this.dup();
    }
    return this.map(function (x) {
      return x / r;
    });
  }

  angleFrom(vector) {
    let V = vector.elements || vector;
    let n = this.elements.length;
    if (n !== V.length) {
      return null;
    }
    let dot = 0,
      mod1 = 0,
      mod2 = 0;
    // Work things out in parallel to save time
    this.each(function (x, i) {
      dot += x * V[i - 1];
      mod1 += x * x;
      mod2 += V[i - 1] * V[i - 1];
    });
    mod1 = Math.sqrt(mod1);
    mod2 = Math.sqrt(mod2);
    if (mod1 * mod2 === 0) {
      return null;
    }
    let theta = dot / (mod1 * mod2);
    if (theta < -1) {
      theta = -1;
    }
    if (theta > 1) {
      theta = 1;
    }
    return Math.acos(theta);
  }

  isParallelTo(vector) {
    let angle = this.angleFrom(vector);
    return angle === null ? null : angle <= Sylvester.precision;
  }

  isAntiparallelTo(vector) {
    let angle = this.angleFrom(vector);
    return angle === null ? null : Math.abs(angle - Math.PI) <= Sylvester.precision;
  }

  isPerpendicularTo(vector) {
    let dot = this.dot(vector);
    return dot === null ? null : Math.abs(dot) <= Sylvester.precision;
  }

  add(vector) {
    let V = vector.elements || vector;
    if (this.elements.length !== V.length) {
      return null;
    }
    return this.map(function (x, i) {
      return x + V[i - 1];
    });
  }

  subtract(vector) {
    let V = vector.elements || vector;
    if (this.elements.length !== V.length) {
      return null;
    }
    return this.map(function (x, i) {
      return x - V[i - 1];
    });
  }

  multiply(k) {
    return this.map(function (x) {
      return x * k;
    });
  }

  dot(vector) {
    let V = vector.elements || vector;
    let product = 0,
      n = this.elements.length;
    if (n !== V.length) {
      return null;
    }
    while (n--) {
      product += this.elements[n] * V[n];
    }
    return product;
  }

  cross(vector) {
    let B = vector.elements || vector;
    if (this.elements.length !== 3 || B.length !== 3) {
      return null;
    }
    let A = this.elements;
    return new Vector([
      A[1] * B[2] - A[2] * B[1],
      A[2] * B[0] - A[0] * B[2],
      A[0] * B[1] - A[1] * B[0],
    ]);
  }

  max() {
    let m = 0,
      i = this.elements.length;
    while (i--) {
      if (Math.abs(this.elements[i]) > Math.abs(m)) {
        m = this.elements[i];
      }
    }
    return m;
  }

  indexOf(x) {
    let index = null,
      n = this.elements.length;
    for (let i = 0; i < n; i++) {
      if (index === null && this.elements[i] === x) {
        index = i + 1;
      }
    }
    return index;
  }

  toDiagonalMatrix() {
    return Matrix.Diagonal(this.elements);
  }

  round() {
    return this.map(function (x) {
      return Math.round(x);
    });
  }

  snapTo(x) {
    return this.map(function (y) {
      return Math.abs(y - x) <= Sylvester.precision ? x : y;
    });
  }

  distanceFrom(obj) {
    if (obj.anchor || (obj.start && obj.end)) {
      return obj.distanceFrom(this);
    }
    let V = obj.elements || obj;
    if (V.length !== this.elements.length) {
      return null;
    }
    let sum = 0,
      part;
    this.each(function (x, i) {
      part = x - V[i - 1];
      sum += part * part;
    });
    return Math.sqrt(sum);
  }

  liesOn(line) {
    return line.contains(this);
  }

  liesIn(plane) {
    return plane.contains(this);
  }

  rotate(t, obj) {
    let V,
      R = null,
      x,
      y,
      z;
    if (t.determinant) {
      R = t.elements;
    }
    switch (this.elements.length) {
      case 2:
        V = obj.elements || obj;
        if (V.length !== 2) {
          return null;
        }
        if (!R) {
          R = Matrix.Rotation(t).elements;
        }
        x = this.elements[0] - V[0];
        y = this.elements[1] - V[1];
        return new Vector([V[0] + R[0][0] * x + R[0][1] * y, V[1] + R[1][0] * x + R[1][1] * y]);
      case 3:
        if (!obj.direction) {
          return null;
        }
        let C = obj.pointClosestTo(this).elements;
        if (!R) {
          R = Matrix.Rotation(t, obj.direction).elements;
        }
        x = this.elements[0] - C[0];
        y = this.elements[1] - C[1];
        z = this.elements[2] - C[2];
        return new Vector([
          C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
          C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
          C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z,
        ]);
      default:
        return null;
    }
  }

  reflectionIn(obj) {
    if (obj.anchor) {
      // obj is a plane or line
      let P = this.elements.slice();
      let C = obj.pointClosestTo(P).elements;
      return new Vector([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
    } else {
      // obj is a point
      let Q = obj.elements || obj;
      if (this.elements.length !== Q.length) {
        return null;
      }
      return this.map(function (x, i) {
        return Q[i - 1] + (Q[i - 1] - x);
      });
    }
  }

  to3D() {
    let V = this.dup();
    switch (V.elements.length) {
      case 3:
        break;
      case 2:
        V.elements.push(0);
        break;
      default:
        return null;
    }
    return V;
  }

  inspect() {
    return '[' + this.elements.join(', ') + ']';
  }

  setElements(els) {
    this.elements = (els.elements || els).slice();
    return this;
  }
}

Vector.prototype.x = Vector.prototype.multiply;
Vector.prototype.each = Vector.prototype.forEach;
