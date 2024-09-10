import { Line } from './line.js';
import { LineSegment } from './lineSegment.js';
import { Plane } from './plane.js';
import { getPrecision } from './precision.js';
import { Vector } from './vector.js';
import { expect, test } from 'vitest';

test('create', () => {
  expect('[0, 1, 7, 5]').toEqual(new Vector([0, 1, 7, 5]).inspect());
  expect('[0, 1.4, 7.034, 5.28638]').toEqual(new Vector([0, 1.4, 7.034, 5.28638]).inspect());
});

test('e', () => {
  let V = new Vector([0, 3, 4, 5]);
  expect(0).toEqual(V.e(1));
  expect(5).toEqual(V.e(4));
  expect(null).toEqual(V.e(5));
});

test('Zero', () => {
  expect('[0, 0, 0, 0]').toEqual(Vector.Zero(4).inspect());
  for (let i = 1; i < 8; i++) {
    expect(0).toEqual(Vector.Zero(i).modulus());
    expect(i).toEqual(Vector.Zero(i).dimensions());
  }
});

test('Random', () => {
  for (let i = 1; i < 8; i++) {
    expect(i).toEqual(Vector.Random(i).dimensions());
  }
});

test('modulus', () => {
  expect(Math.sqrt(50)).toEqual(new Vector([0, 3, 4, 5]).modulus());
  expect(1).toEqual(Vector.i.modulus());
});

test('dimensions', () => {
  expect(4).toEqual(new Vector([0, 3, 4, 5]).dimensions());
});

test('eql', () => {
  let V = Vector.Random(6);
  expect(V.eql(V)).toBeTruthy();
  expect(Vector.Zero(3).eql([0, 0, 0])).toBeTruthy();
  expect(new Vector([3, 6, 9]).eql([3.0, 6.0, 9.0])).toBeTruthy();
  expect(new Vector([3.01, 6, 9]).eql([3.0, 6.0, 9.0])).toBeFalsy();
  expect(new Vector([3, 6, 9]).eql([3, 6, 10])).toBeFalsy();
  expect(new Vector([3, 6, 9]).eql([3, 7, 9])).toBeFalsy();
  expect(new Vector([3, 6, 9]).eql([4, 6, 9])).toBeFalsy();
});

test('single element', () => {
  let V = new Vector([4]);
  expect('[4]').toEqual(V.inspect());
  expect(4).toEqual(V.modulus());
});

test('dup', () => {
  let V = new Vector([3, 4, 5]);
  let dup = V.dup();
  expect(V.eql(dup)).toBeTruthy();
  dup.elements[0] = 24;
  expect(V.eql([3, 4, 5])).toBeTruthy();
  expect(dup.eql([24, 4, 5])).toBeTruthy();
});

test('map', () => {
  let V = new Vector([1, 6, 3, 9]);
  expect(
    V.map(function (x) {
      return x * x;
    }).eql([1, 36, 9, 81]),
  ).toBeTruthy();
});

test('normalize', () => {
  let V = new Vector([8, 2, 9, 4]);
  expect(1).toEqual(V.toUnitVector().modulus());
  expect(V.toUnitVector().x(Math.sqrt(165)).eql(V)).toBeTruthy();
  expect(V.toUnitVector().isParallelTo(V)).toBeTruthy();
});

test('angleFrom', () => {
  let k = getPrecision();
  expect(Math.PI / 2).toEqual(Vector.i.angleFrom(Vector.j));
  expect(Math.round((Math.PI / 4) * k) / k).toEqual(
    Math.round(new Vector([1, 0]).angleFrom(new Vector([1, 1])) * k) / k,
  );
  expect(Vector.i.angleFrom([1, 6, 3, 5])).toBeNull();
});

test('angle types', () => {
  expect(Vector.i.isParallelTo(Vector.i.x(235457))).toBeTruthy();
  expect(Vector.i.isParallelTo([8, 9])).toBeNull();
  expect(Vector.i.isAntiparallelTo(Vector.i.x(-235457))).toBeTruthy();
  expect(Vector.i.isAntiparallelTo([8, 9])).toBeNull();
  expect(Vector.i.isPerpendicularTo(Vector.k)).toBeTruthy();
  expect(Vector.i.isPerpendicularTo([8, 9, 0, 3])).toBeNull();
});

test('arithmetic', () => {
  let V1 = new Vector([2, 9, 4]);
  let V2 = new Vector([5, 13, 7]);
  expect(V1.add(V2).eql([7, 22, 11])).toBeTruthy();
  expect(V1.subtract(V2).eql([-3, -4, -3])).toBeTruthy();
  expect(V1.add([2, 8])).toBeNull();
  expect(V1.subtract([9, 3, 6, 1, 7])).toBeNull();
  expect(V1.x(4).eql([8, 36, 16])).toBeTruthy();
});

test('products', () => {
  let V1 = new Vector([2, 9, 4]);
  let V2 = new Vector([5, 13, 7]);
  expect(2 * 5 + 9 * 13 + 4 * 7).toEqual(V1.dot(V2));
  expect(V1.cross(V2).eql([9 * 7 - 4 * 13, 4 * 5 - 2 * 7, 2 * 13 - 9 * 5])).toBeTruthy();
  expect(V1.dot([7, 9])).toBeNull();
  expect(V2.cross([9, 1, 4, 3])).toBeNull();
});

test('max', () => {
  let V = new Vector([2, 8, 5, 9, 3, 7, 12]);
  expect(12).toEqual(V.max());
  V = new Vector([-17, 8, 5, 9, 3, 7, 12]);
  expect(-17).toEqual(V.max());
});

test('indexOf', () => {
  let V = new Vector([2, 6, 0, 3]);
  expect(1).toEqual(V.indexOf(2));
  expect(4).toEqual(V.indexOf(3));
  expect(2).toEqual(V.indexOf(V.max()));
  expect(V.indexOf(7)).toBeNull();
});

test('toDiagonalMatrix', () => {
  expect(
    new Vector([2, 6, 4, 3]).toDiagonalMatrix().eql([
      [2, 0, 0, 0],
      [0, 6, 0, 0],
      [0, 0, 4, 0],
      [0, 0, 0, 3],
    ]),
  ).toBeTruthy();
});

test('round', () => {
  expect(new Vector([2.56, 3.5, 3.49]).round().eql([3, 4, 3])).toBeTruthy();
});

test('distanceFrom', () => {
  expect(new Vector([1, 9, 0, 13]).modulus()).toEqual(
    new Vector([3, 9, 4, 6]).distanceFrom([2, 0, 4, -7]),
  );
  expect(Math.sqrt(64 + 49)).toEqual(new Vector([2, 8, 7]).distanceFrom(Line.X));
  expect(78).toEqual(new Vector([28, -43, 78]).distanceFrom(Plane.XY));
  expect(5).toEqual(new Vector([7, 4, 0]).distanceFrom(new LineSegment([0, 0, 0], [4, 0, 0])));
});

test('liesIn', () => {
  expect(new Vector([12, 0, 0]).liesOn(Line.X)).toBeTruthy();
  expect(new Vector([12, 1, 0]).liesOn(Line.X)).toBeFalsy();
  expect(new Vector([12, 0, 3]).liesOn(Line.X)).toBeFalsy();
  expect(new Vector([9, 16, 4]).liesOn(new LineSegment([2, 9, 4], [14, 21, 4]))).toBeTruthy();
  expect(new Vector([9, 17, 4]).liesOn(new LineSegment([2, 9, 4], [14, 21, 4]))).toBeFalsy();
  expect(new Vector([0, -3, 6]).liesIn(Plane.YZ)).toBeTruthy();
  expect(new Vector([4, -3, 6]).liesIn(Plane.YZ)).toBeFalsy();
});

test('reflectionIn', () => {
  expect(new Vector([3, 0, 0]).reflectionIn([0, 3, 0]).eql([-3, 6, 0])).toBeTruthy();
  expect(
    new Vector([3, 0, 0]).reflectionIn(new Line([0, 0, 0], [1, 0, 1])).eql([0, 0, 3]),
  ).toBeTruthy();
  let V1 = new Vector([25, -48, 77]);
  let V2 = new Vector([25, -48, -77]);
  expect(V1.reflectionIn(Plane.XY).eql(V2)).toBeTruthy();
  expect(V2.reflectionIn(Plane.YX).eql(V1)).toBeTruthy();
});

test('rotate', () => {
  expect(new Vector([12, 1]).rotate(Math.PI / 2, [5, 1]).eql([5, 8])).toBeTruthy();
  expect(
    Vector.i.rotate(-Math.PI / 2, new Line([10, 0, 100], Vector.k)).eql([10, 9, 0]),
  ).toBeTruthy();
});
