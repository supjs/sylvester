import { getPrecision } from './precision.js';
import { Vector } from './vector.js';

export class Matrix {
  static I(n) {
    let els = [],
      i = n,
      j;
    while (i--) {
      j = n;
      els[i] = [];
      while (j--) {
        els[i][j] = i === j ? 1 : 0;
      }
    }
    return new Matrix(els);
  }

  static Diagonal(elements) {
    let i = elements.length;
    let M = Matrix.I(i);
    while (i--) {
      M.elements[i][i] = elements[i];
    }
    return M;
  }

  static Rotation(theta, a) {
    if (!a) {
      return new Matrix([
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)],
      ]);
    }
    let axis = a.dup();
    if (axis.elements.length !== 3) {
      return null;
    }
    let mod = axis.modulus();
    let x = axis.elements[0] / mod,
      y = axis.elements[1] / mod,
      z = axis.elements[2] / mod;
    let s = Math.sin(theta),
      c = Math.cos(theta),
      t = 1 - c;
    // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
    // That proof rotates the co-ordinate system so theta becomes -theta and sin
    // becomes -sin here.
    return new Matrix([
      [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
      [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
      [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
    ]);
  }

  static RotationX(t) {
    let c = Math.cos(t),
      s = Math.sin(t);
    return new Matrix([
      [1, 0, 0],
      [0, c, -s],
      [0, s, c],
    ]);
  }

  static RotationY(t) {
    let c = Math.cos(t),
      s = Math.sin(t);
    return new Matrix([
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c],
    ]);
  }

  static RotationZ(t) {
    let c = Math.cos(t),
      s = Math.sin(t);
    return new Matrix([
      [c, -s, 0],
      [s, c, 0],
      [0, 0, 1],
    ]);
  }

  static Random(n, m) {
    return Matrix.Zero(n, m).map(function () {
      return Math.random();
    });
  }

  static Zero(n, m) {
    let els = [],
      i = n,
      j;
    while (i--) {
      j = m;
      els[i] = [];
      while (j--) {
        els[i][j] = 0;
      }
    }
    return new Matrix(els);
  }

  constructor(elements) {
    this.setElements(elements);
  }

  e(i, j) {
    if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) {
      return null;
    }
    return this.elements[i - 1][j - 1];
  }

  row(i) {
    if (i > this.elements.length) {
      return null;
    }
    return new Vector(this.elements[i - 1]);
  }

  col(j) {
    if (this.elements.length === 0) {
      return null;
    }
    if (j > this.elements[0].length) {
      return null;
    }
    let col = [],
      n = this.elements.length;
    for (let i = 0; i < n; i++) {
      col.push(this.elements[i][j - 1]);
    }
    return new Vector(col);
  }

  dimensions() {
    let cols = this.elements.length === 0 ? 0 : this.elements[0].length;
    return { rows: this.elements.length, cols: cols };
  }

  rows() {
    return this.elements.length;
  }

  cols() {
    if (this.elements.length === 0) {
      return 0;
    }
    return this.elements[0].length;
  }

  eql(matrix) {
    let M = matrix.elements || matrix;
    if (!M[0] || typeof M[0][0] === 'undefined') {
      M = new Matrix(M).elements;
    }
    if (this.elements.length === 0 || M.length === 0) {
      return this.elements.length === M.length;
    }
    if (this.elements.length !== M.length) {
      return false;
    }
    if (this.elements[0].length !== M[0].length) {
      return false;
    }
    let i = this.elements.length,
      nj = this.elements[0].length,
      j;
    while (i--) {
      j = nj;
      while (j--) {
        if (Math.abs(this.elements[i][j] - M[i][j]) > getPrecision()) {
          return false;
        }
      }
    }
    return true;
  }

  dup() {
    return new Matrix(this.elements);
  }

  map(fn, context) {
    if (this.elements.length === 0) {
      return new Matrix([]);
    }
    let els = [],
      i = this.elements.length,
      nj = this.elements[0].length,
      j;
    while (i--) {
      j = nj;
      els[i] = [];
      while (j--) {
        els[i][j] = fn.call(context, this.elements[i][j], i + 1, j + 1);
      }
    }
    return new Matrix(els);
  }

  isSameSizeAs(matrix) {
    let M = matrix.elements || matrix;
    if (typeof M[0][0] === 'undefined') {
      M = new Matrix(M).elements;
    }
    if (this.elements.length === 0) {
      return M.length === 0;
    }
    return this.elements.length === M.length && this.elements[0].length === M[0].length;
  }

  add(matrix) {
    if (this.elements.length === 0)
      return this.map(function (x) {
        return x;
      });
    let M = matrix.elements || matrix;
    if (typeof M[0][0] === 'undefined') {
      M = new Matrix(M).elements;
    }
    if (!this.isSameSizeAs(M)) {
      return null;
    }
    return this.map(function (x, i, j) {
      return x + M[i - 1][j - 1];
    });
  }

  subtract(matrix) {
    if (this.elements.length === 0)
      return this.map(function (x) {
        return x;
      });
    let M = matrix.elements || matrix;
    if (typeof M[0][0] === 'undefined') {
      M = new Matrix(M).elements;
    }
    if (!this.isSameSizeAs(M)) {
      return null;
    }
    return this.map(function (x, i, j) {
      return x - M[i - 1][j - 1];
    });
  }

  canMultiplyFromLeft(matrix) {
    if (this.elements.length === 0) {
      return false;
    }
    let M = matrix.elements || matrix;
    if (typeof M[0][0] === 'undefined') {
      M = new Matrix(M).elements;
    }
    // this.columns should equal matrix.rows
    return this.elements[0].length === M.length;
  }

  multiply(matrix) {
    if (this.elements.length === 0) {
      return null;
    }
    if (!matrix.elements) {
      return this.map(function (x) {
        return x * matrix;
      });
    }
    let returnVector = matrix.modulus ? true : false;
    let M = matrix.elements || matrix;
    if (typeof M[0][0] === 'undefined') {
      M = new Matrix(M).elements;
    }
    if (!this.canMultiplyFromLeft(M)) {
      return null;
    }
    let i = this.elements.length,
      nj = M[0].length,
      j;
    let cols = this.elements[0].length,
      c,
      elements = [],
      sum;
    while (i--) {
      j = nj;
      elements[i] = [];
      while (j--) {
        c = cols;
        sum = 0;
        while (c--) {
          sum += this.elements[i][c] * M[c][j];
        }
        elements[i][j] = sum;
      }
    }
    M = new Matrix(elements);
    return returnVector ? M.col(1) : M;
  }

  minor(a, b, c, d) {
    if (this.elements.length === 0) {
      return null;
    }
    let elements = [],
      ni = c,
      i,
      nj,
      j;
    let rows = this.elements.length,
      cols = this.elements[0].length;
    while (ni--) {
      i = c - ni - 1;
      elements[i] = [];
      nj = d;
      while (nj--) {
        j = d - nj - 1;
        elements[i][j] = this.elements[(a + i - 1) % rows][(b + j - 1) % cols];
      }
    }
    return new Matrix(elements);
  }

  transpose() {
    if (this.elements.length === 0) return new Matrix([]);
    let rows = this.elements.length,
      cols = this.elements[0].length,
      j;
    let elements = [],
      i = cols;
    while (i--) {
      j = rows;
      elements[i] = [];
      while (j--) {
        elements[i][j] = this.elements[j][i];
      }
    }
    return new Matrix(elements);
  }

  isSquare() {
    let cols = this.elements.length === 0 ? 0 : this.elements[0].length;
    return this.elements.length === cols;
  }

  max() {
    if (this.elements.length === 0) {
      return null;
    }
    let m = 0,
      i = this.elements.length,
      nj = this.elements[0].length,
      j;
    while (i--) {
      j = nj;
      while (j--) {
        if (Math.abs(this.elements[i][j]) > Math.abs(m)) {
          m = this.elements[i][j];
        }
      }
    }
    return m;
  }

  indexOf(x) {
    if (this.elements.length === 0) {
      return null;
    }
    let ni = this.elements.length,
      i,
      nj = this.elements[0].length,
      j;
    for (i = 0; i < ni; i++) {
      for (j = 0; j < nj; j++) {
        if (this.elements[i][j] === x) {
          return { i: i + 1, j: j + 1 };
        }
      }
    }
    return null;
  }

  diagonal() {
    if (!this.isSquare) {
      return null;
    }
    let els = [],
      n = this.elements.length;
    for (let i = 0; i < n; i++) {
      els.push(this.elements[i][i]);
    }
    return new Vector(els);
  }

  toRightTriangular() {
    if (this.elements.length === 0) return new Matrix([]);
    let M = this.dup(),
      els;
    let n = this.elements.length,
      i,
      j,
      np = this.elements[0].length,
      p;
    for (i = 0; i < n; i++) {
      if (M.elements[i][i] === 0) {
        for (j = i + 1; j < n; j++) {
          if (M.elements[j][i] !== 0) {
            els = [];
            for (p = 0; p < np; p++) {
              els.push(M.elements[i][p] + M.elements[j][p]);
            }
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] !== 0) {
        for (j = i + 1; j < n; j++) {
          let multiplier = M.elements[j][i] / M.elements[i][i];
          els = [];
          for (p = 0; p < np; p++) {
            // Elements with column numbers up to an including the number of the
            // row that we're subtracting can safely be set straight to zero,
            // since that's the point of this routine and it avoids having to
            // loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
          }
          M.elements[j] = els;
        }
      }
    }
    return M;
  }

  determinant() {
    if (this.elements.length === 0) {
      return 1;
    }
    if (!this.isSquare()) {
      return null;
    }
    let M = this.toRightTriangular();
    let det = M.elements[0][0],
      n = M.elements.length;
    for (let i = 1; i < n; i++) {
      det = det * M.elements[i][i];
    }
    return det;
  }

  isSingular() {
    return this.isSquare() && this.determinant() === 0;
  }

  trace() {
    if (this.elements.length === 0) {
      return 0;
    }
    if (!this.isSquare()) {
      return null;
    }
    let tr = this.elements[0][0],
      n = this.elements.length;
    for (let i = 1; i < n; i++) {
      tr += this.elements[i][i];
    }
    return tr;
  }

  rank() {
    if (this.elements.length === 0) {
      return 0;
    }
    let M = this.toRightTriangular(),
      rank = 0;
    let i = this.elements.length,
      nj = this.elements[0].length,
      j;
    while (i--) {
      j = nj;
      while (j--) {
        if (Math.abs(M.elements[i][j]) > getPrecision()) {
          rank++;
          break;
        }
      }
    }
    return rank;
  }

  augment(matrix) {
    if (this.elements.length === 0) {
      return this.dup();
    }
    let M = matrix.elements || matrix;
    if (typeof M[0][0] === 'undefined') {
      M = new Matrix(M).elements;
    }
    let T = this.dup(),
      cols = T.elements[0].length;
    let i = T.elements.length,
      nj = M[0].length,
      j;
    if (i !== M.length) {
      return null;
    }
    while (i--) {
      j = nj;
      while (j--) {
        T.elements[i][cols + j] = M[i][j];
      }
    }
    return T;
  }

  inverse() {
    if (this.elements.length === 0) {
      return null;
    }
    if (!this.isSquare() || this.isSingular()) {
      return null;
    }
    let n = this.elements.length,
      i = n,
      j;
    let M = this.augment(Matrix.I(n)).toRightTriangular();
    let np = M.elements[0].length,
      p,
      els,
      divisor;
    let inverse_elements = [],
      new_element;
    // Sylvester.Matrix is non-singular so there will be no zeros on the
    // diagonal. Cycle through rows from last to first.
    while (i--) {
      // First, normalise diagonal elements to 1
      els = [];
      inverse_elements[i] = [];
      divisor = M.elements[i][i];
      for (p = 0; p < np; p++) {
        new_element = M.elements[i][p] / divisor;
        els.push(new_element);
        // Shuffle off the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= n) {
          inverse_elements[i].push(new_element);
        }
      }
      M.elements[i] = els;
      // Then, subtract this row from those above it to give the identity matrix
      // on the left hand side
      j = i;
      while (j--) {
        els = [];
        for (p = 0; p < np; p++) {
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        }
        M.elements[j] = els;
      }
    }
    return new Matrix(inverse_elements);
  }

  round() {
    return this.map(function (x) {
      return Math.round(x);
    });
  }

  snapTo(x) {
    return this.map(function (p) {
      return Math.abs(p - x) <= getPrecision() ? x : p;
    });
  }

  inspect() {
    let matrix_rows = [];
    let n = this.elements.length;
    if (n === 0) return '[]';
    for (let i = 0; i < n; i++) {
      matrix_rows.push(new Vector(this.elements[i]).inspect());
    }
    return matrix_rows.join('\n');
  }

  setElements(els) {
    let i,
      j,
      elements = els.elements || els;
    if (elements[0] && typeof elements[0][0] !== 'undefined') {
      i = elements.length;
      this.elements = [];
      while (i--) {
        j = elements[i].length;
        this.elements[i] = [];
        while (j--) {
          this.elements[i][j] = elements[i][j];
        }
      }
      return this;
    }
    let n = elements.length;
    this.elements = [];
    for (i = 0; i < n; i++) {
      this.elements.push([elements[i]]);
    }
    return this;
  }
}

Matrix.prototype.toUpperTriangular = Matrix.prototype.toRightTriangular;
Matrix.prototype.det = Matrix.prototype.determinant;
Matrix.prototype.tr = Matrix.prototype.trace;
Matrix.prototype.rk = Matrix.prototype.rank;
Matrix.prototype.inv = Matrix.prototype.inverse;
Matrix.prototype.x = Matrix.prototype.multiply;
