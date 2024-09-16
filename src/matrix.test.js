import { expect, test } from 'vitest';
import { Matrix } from './matrix.js';
import { Sylvester } from './sylvester.js';
import { Vector } from './vector.js';

test('create', () => {
  let M = new Matrix([
    [0, 3, 4, 8],
    [3, 9, 7, 3],
  ]);
  expect('[0, 3, 4, 8]\n[3, 9, 7, 3]').toEqual(M.inspect());
  expect('[0, 2, 7, 5]').toEqual(new Matrix([[0, 2, 7, 5]]).inspect());
  expect('[0]\n[2]\n[7]\n[5]').toEqual(new Matrix([[0], [2], [7], [5]]).inspect());
  expect('[128]').toEqual(new Matrix([[128]]).inspect());
  expect('[]').toEqual(new Matrix([]).inspect());
});

test('I', () => {
  expect(
    Matrix.I(3).eql(
      new Matrix([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]),
    ),
  ).toBeTruthy();
  expect(Matrix.I(1).eql(new Matrix([[1]]))).toBeTruthy();
  expect(Matrix.I(0).eql(new Matrix([]))).toBeTruthy();
});

test('e', () => {
  let M = new Matrix([
    [0, 3, 4, 8],
    [3, 9, 7, 3],
  ]);
  expect(0).toEqual(M.e(1, 1));
  expect(8).toEqual(M.e(1, 4));
  expect(M.e(2, 6)).toBeNull();
});

test('rows and columns', () => {
  let M = new Matrix([
    [0, 3, 4, 8],
    [3, 9, 7, 3],
  ]);
  expect(M.row(2).eql([3, 9, 7, 3])).toBeTruthy();
  expect(M.row(3)).toBeNull();
  expect(M.col(2).eql([3, 9])).toBeTruthy();
  expect(M.col(6)).toBeNull();
  expect(new Matrix([]).row(1)).toBeNull();
  expect(new Matrix([]).col(1)).toBeNull();
});

test('dimensions', () => {
  let M = new Matrix([
    [0, 3, 4, 8],
    [3, 9, 7, 3],
  ]);
  expect(2).toEqual(M.rows());
  expect(4).toEqual(M.cols());
  expect([0, 0]).toEqual([new Matrix([]).rows(), new Matrix([]).cols()]);
  expect({ rows: 0, cols: 0 }).toEqual(new Matrix([]).dimensions());
});

test('dup', () => {
  let M1 = new Matrix([
    [2, 3, 8],
    [7, 0, 2],
    [6, 3, 0],
  ]);
  let M2 = M1.dup();
  expect(M1.eql(M2)).toBeTruthy();
  M2.elements[1][1] = 99;
  expect(M1.eql(M2)).toBeFalsy();
  expect(0).toEqual(M1.elements[1][1]);
});

test('eql', () => {
  let M = new Matrix([
    [2, 3, 8],
    [7, 0, 2],
    [6, 3, 0],
  ]);
  expect(
    M.eql([
      [2, 3, 8],
      [7, 0, 2],
      [6, 3, 0],
    ]),
  ).toBeTruthy();
  expect(
    M.eql([
      [7, 3, 8],
      [7, 0, 2],
      [6, 3, 0],
    ]),
  ).toBeFalsy();
  expect(
    M.eql([
      [2, 7, 8],
      [7, 0, 2],
      [6, 3, 0],
    ]),
  ).toBeFalsy();
  expect(
    M.eql([
      [2, 3, 7],
      [7, 0, 2],
      [6, 3, 0],
    ]),
  ).toBeFalsy();
  expect(
    M.eql([
      [2, 3, 8],
      [8, 0, 2],
      [6, 3, 0],
    ]),
  ).toBeFalsy();
  expect(
    M.eql([
      [2, 3, 8],
      [7, 7, 2],
      [6, 3, 0],
    ]),
  ).toBeFalsy();
  expect(
    M.eql([
      [2, 3, 8],
      [7, 0, 7],
      [6, 3, 0],
    ]),
  ).toBeFalsy();
  expect(
    M.eql([
      [2, 3, 8],
      [7, 0, 2],
      [7, 3, 0],
    ]),
  ).toBeFalsy();
  expect(
    M.eql([
      [2, 3, 8],
      [7, 0, 2],
      [6, 7, 0],
    ]),
  ).toBeFalsy();
  expect(
    M.eql([
      [2, 3, 8],
      [7, 0, 2],
      [6, 3, 7],
    ]),
  ).toBeFalsy();
});

test('map', () => {
  expect(
    new Matrix([
      [2, 3, 8],
      [7, 0, 2],
      [6, 3, 0],
    ])
      .map(function (x, i, j) {
        return x + j;
      })
      .eql([
        [3, 5, 11],
        [8, 2, 5],
        [7, 5, 3],
      ]),
  ).toBeTruthy();
});

test('Random', () => {
  let M;
  for (let i = 1; i < 5; i++) {
    M = Matrix.Random(4, i);
    expect(4).toEqual(M.rows());
    expect(i).toEqual(M.cols());
    M = Matrix.Random(i, 3);
    expect(i).toEqual(M.rows());
    expect(3).toEqual(M.cols());
  }
});

test('Zero', () => {
  let M;
  for (let i = 1; i < 5; i++) {
    M = Matrix.Random(5, i);
    expect(5).toEqual(M.rows());
    expect(i).toEqual(M.cols());
    M = Matrix.Random(i, 2);
    expect(i).toEqual(M.rows());
    expect(2).toEqual(M.cols());
  }
  expect(Matrix.Random(0, 0).eql(new Matrix([]))).toBeTruthy();
});

test('isSameSizeAs', () => {
  expect(Matrix.Random(2, 5).isSameSizeAs(Matrix.Zero(2, 5))).toBeTruthy();
  expect(Matrix.Random(2, 6).isSameSizeAs(Matrix.Zero(2, 5))).toBeFalsy();
  expect(Matrix.Random(1, 5).isSameSizeAs(Matrix.Zero(2, 5))).toBeFalsy();
});

test('arithmetic', () => {
  let M1 = new Matrix([
    [2, 5, 9, 3],
    [9, 2, 8, 5],
  ]);
  let M2 = new Matrix([
    [7, 1, 0, 8],
    [0, 4, 3, 8],
  ]);
  let M = new Matrix([
    [9, 6, 9, 11],
    [9, 6.0, 11, 13],
  ]);
  expect(M1.add(M2).eql(M)).toBeTruthy();
  expect(M2.add(M1).eql(M)).toBeTruthy();
  expect(M1.add(Matrix.Zero(2, 5))).toBeNull();
  M = new Matrix([
    [-5, 4, 9.0, -5],
    [9, -2, 5, -3],
  ]);
  expect(M1.subtract(M2).eql(M)).toBeTruthy();
  expect(M2.subtract(M1).eql(M.x(-1))).toBeTruthy();
  expect(M1.subtract(Matrix.Zero(2, 7))).toBeNull();
  expect(
    M2.x(3).eql([
      [21, 3, 0, 24],
      [0, 12, 9, 24],
    ]),
  ).toBeTruthy();
});

test('multiplication', () => {
  let M1 = new Matrix([
    [2, 5, 9, 3],
    [9, 2, 8, 5],
  ]);
  let M2 = new Matrix([
    [2, 9],
    [0, 2],
    [8, 1],
    [0, 6],
  ]);
  expect(2).toEqual(M1.x(M2).rows());
  expect(2).toEqual(M1.x(M2).cols());
  expect(
    M1.x(M2).eql([
      [76, 55],
      [82, 123],
    ]),
  ).toBeTruthy();
  expect(4).toEqual(M2.x(M1).rows());
  expect(4).toEqual(M2.x(M1).cols());
  expect(M1.x(M1.x(M2))).toBeNull();
  expect(M1.x(M2.x(M1))).not.toBeNull();
});

test('minor', () => {
  let M2 = new Matrix([
    [2, 9],
    [0, 2],
    [8, 1],
    [0, 6],
  ]);
  let M = new Matrix([
    [9, 2, 9],
    [2, 0, 2],
    [1, 8, 1],
  ]);
  expect(M2.minor(1, 2, 3, 3).eql(M)).toBeTruthy();
});

test('isSquare', () => {
  expect(Matrix.Zero(9, 9).isSquare()).toBeTruthy();
  expect(Matrix.Zero(4, 9).isSquare()).toBeFalsy();
  expect(Matrix.Zero(9, 3).isSquare()).toBeFalsy();
  expect(new Matrix([]).isSquare()).toBeTruthy();
});

test('max and index', () => {
  let M = new Matrix([
    [2, 5, 9, 3],
    [9, 2, 8, 5],
  ]);
  expect(9).toEqual(M.max());
  expect(M.indexOf(8).i === 2 && M.indexOf(8).j === 3).toBeTruthy();
  expect(M.indexOf(9).i === 1 && M.indexOf(9).j === 3).toBeTruthy();
});

test('diagonal', () => {
  let M = new Matrix([
    [9, 2, 9],
    [2, 0, 2],
    [1, 8, 1],
  ]);
  expect(M.diagonal().eql([9, 0, 1])).toBeTruthy();
});

test('toRightTriangular', () => {
  for (let i = 0, M; i < 8; i++) {
    M = Matrix.Random(3, 3);
    expect(M.toRightTriangular().inspect()).toMatch(
      /^\[[0-9\-\.]+, [0-9\-\.]+, [0-9\-\.]+\]\n\[0, [0-9\-\.]+, [0-9\-\.]+\]\n\[0, 0, [0-9\-\.]+\]$/,
    );
  }
});

test('transpose', () => {
  let M1 = new Matrix([
    [3, 9, 8, 4],
    [2, 0, 1, 5],
  ]);
  let M2 = new Matrix([
    [3, 2],
    [9, 0],
    [8, 1],
    [4, 5],
  ]);
  expect(M1.transpose().eql(M2)).toBeTruthy();
  expect(M2.transpose().eql(M1)).toBeTruthy();
});

test('determinant', () => {
  for (let i = 0, M; i < 5; i++) {
    M = Matrix.Random(3, 3).x(10).elements;
    expect(
      M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) +
        M[0][1] * (M[1][2] * M[2][0] - M[1][0] * M[2][2]) +
        M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]) -
        new Matrix(M).determinant() <
        Sylvester.precision,
    ).toBeTruthy();
  }
  expect(Matrix.Random(3, 4).determinant()).toBeNull();
  expect(1).toEqual(new Matrix([]).det());
});

test('isSingular', () => {
  let M = Matrix.Random(3, 3).x(10);
  M.elements[0][0] = M.elements[1][0] = M.elements[2][0] = 0;
  expect(M.isSingular()).toBeTruthy();
  expect(Matrix.Zero(4, 3).isSingular()).toBeFalsy();
});

test('trace', () => {
  let M = new Matrix([
    [8, 1, 6],
    [0, 1, 7],
    [0, 1, 5],
  ]);
  expect(14).toEqual(M.tr());
  expect(Matrix.Random(4, 5).tr()).toBeNull();
});

test('rank', () => {
  let M = new Matrix([
    [1, 9, 4, 6],
    [9, 2, 7, 4],
    [18, 4, 14, 8],
  ]);
  expect(2).toEqual(M.rk());
});

test('augment', () => {
  expect(
    new Matrix([
      [7, 2, 9, 4],
      [4, 8, 2, 6],
      [9, 2, 5, 6],
    ])
      .augment([
        [4, 6],
        [5, 2],
        [8, 2],
      ])
      .eql([
        [7, 2, 9, 4, 4, 6],
        [4, 8, 2, 6, 5, 2],
        [9, 2, 5, 6, 8, 2],
      ]),
  ).toBeTruthy();
});

test('inverse', () => {
  for (let i = 0, M; i < 10; i++) {
    M = Matrix.Random(4, 4).x(5);
    if (M.isSingular()) {
      continue;
    }
    expect(M.x(M.inv()).eql(Matrix.I(4))).toBeTruthy();
    expect(M.inv().x(M).eql(Matrix.I(4))).toBeTruthy();
  }
  expect(new Matrix([[4]]).inv().eql(new Matrix([[0.25]]))).toBeTruthy();
});

test('Rotation', () => {
  expect(
    Matrix.Rotation(Math.PI / 2).eql([
      [0, -1],
      [1, 0],
    ]),
  ).toBeTruthy();
  expect(
    Matrix.Rotation(Math.PI / 2, Vector.j).eql([
      [0, 0, 1],
      [0, 1, 0],
      [-1, 0, 0],
    ]),
  ).toBeTruthy();
});

test('Diagonal', () => {
  expect(
    Matrix.Diagonal([3, 9, 5, 7]).eql([
      [3, 0, 0, 0],
      [0, 9, 0, 0],
      [0, 0, 5, 0],
      [0, 0, 0, 7],
    ]),
  ).toBeTruthy();
});
