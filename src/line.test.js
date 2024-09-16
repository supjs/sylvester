import { expect, test } from 'vitest';
import { Line } from './line.js';
import { Plane } from './plane.js';
import { LineSegment } from './lineSegment.js';
import { Sylvester } from './sylvester.js';
import { Vector } from './vector.js';

test('dup', () => {
  let L = Line.X.dup();
  expect(L.eql(Line.X)).toBeTruthy();
  L.anchor.setElements([8, 2, 5]);
  L.direction.setElements([2, 5, 6]);
  expect(Line.X.anchor.eql([0, 0, 0])).toBeTruthy();
  expect(Line.X.direction.eql(Vector.i)).toBeTruthy();
  expect(L.eql(Line.X)).toBeFalsy();
});

test('equality with antiparallel lines', () => {
  expect(Line.X.eql(new Line([0, 0, 0], [-12, 0, 0]))).toBeTruthy();
});

test('contains', () => {
  expect(Line.X.contains([99, 0, 0])).toBeTruthy();
  expect(Line.X.contains([99, 1, 0])).toBeFalsy();
  expect(Line.X.contains([99, 0, 2])).toBeFalsy();
  expect(
    new Line([0, 0, 0], [1, 1, 1]).contains(new LineSegment([-2, -2, -2], [13, 13, 13])),
  ).toBeTruthy();
});

test('isParallelTo', () => {
  expect(Line.X.isParallelTo(new Line([0, 0, -12], [-4, 0, 0]))).toBeTruthy();
  expect(Line.X.isParallelTo(new Plane([0, 0, -4], Vector.k))).toBeTruthy();
  expect(Line.Z.isParallelTo(new Plane([0, 0, -4], Vector.k))).toBeFalsy();
  expect(Line.Z.isParallelTo(new LineSegment([9, 2, 6], [9, 2, 44]))).toBeTruthy();
  expect(Line.Z.isParallelTo(new LineSegment([9, 3, 6], [9, 2, 44]))).toBeFalsy();
});

test('translate', () => {
  expect(
    Line.X.dup()
      .translate([0, 0, 12])
      .eql(new Line([0, 0, 12], Vector.i)),
  ).toBeTruthy();
});

test('intersectionWith', () => {
  for (let i = 0, O, V, V1, V2, L1, L2; i < 5; i++) {
    O = new Vector([-5, -5, -5]);
    V = O.add(Vector.Random(3).x(10));
    V1 = O.add(Vector.Random(3).x(10));
    V2 = O.add(Vector.Random(3).x(10));
    L1 = new Line(V, V1);
    L2 = new Line(V.add(V1.x(-20 + 40 * Math.random())), V2);
    V = L1.intersectionWith(L2);
    expect(L1.contains(V)).toBeTruthy();
    expect(L2.contains(V)).toBeTruthy();
  }
  expect(
    new Line([5, 0], [0, 1]).intersectionWith(new Line([0, 0], [-1, -1])).eql([5, 5, 0]),
  ).toBeTruthy();
  expect(Line.X.intersects(new LineSegment([7, -4, 0], [7, 5, 0]))).toBeTruthy();
  expect(Line.X.intersects(new LineSegment([7, -4, -1], [7, 5, 0]))).toBeFalsy();
});

test('positionOf', () => {
  expect(
    new Line([0, 0, 0], [1, 1, -1]).positionOf([3, 3, -3]) - Math.sqrt(27) <= Sylvester.precision,
  ).toBeTruthy();
});

test('pointClosestTo', () => {
  expect(Line.X.pointClosestTo(new Vector([26, -2, 18])).eql([26, 0, 0])).toBeTruthy();
  expect(
    new Line([0, 0, 0], [1, 0, 0]).pointClosestTo(new Line([0, 0, 24], [1, 1, 0])).eql([0, 0, 0]),
  ).toBeTruthy();
  expect(
    new Line([0, 0, 24], [1, 1, 0]).pointClosestTo(new Line([0, 0, 0], [-1, 0, 0])).eql([0, 0, 24]),
  ).toBeTruthy();
  expect(Line.X.pointClosestTo(new LineSegment([3, 5], [9, 9])).eql([3, 0, 0])).toBeTruthy();
  expect(Line.X.pointClosestTo(new LineSegment([2, -2, 2], [4, 2, 2])).eql([3, 0, 0])).toBeTruthy();
});

test('distanceFrom', () => {
  expect(24).toEqual(new Line([0, 0, 0], [1, 0, 0]).distanceFrom(new Line([0, 0, 24], [1, 1, 0])));
  expect(12).toEqual(new Line([12, 0, 0], Vector.k).distanceFrom(Plane.YZ));
  expect(0).toEqual(new Line([12, 0, 0], [1, 0, 200]).distanceFrom(Plane.YZ));
  expect(
    Math.abs(Math.sqrt(18) - Line.X.distanceFrom(new LineSegment([12, 3, 3], [15, 4, 3]))) <=
      Sylvester.precision,
  ).toBeTruthy();
});

test('reflectionIn', () => {
  expect(Line.Z.reflectionIn([28, 0, -12]).eql(new Line([56, 0, 0], Vector.k.x(-1)))).toBeTruthy();
  expect(Line.X.reflectionIn(new Line([0, 0, 0], [1, 0, 1])).eql(Line.Z)).toBeTruthy();
  let L1 = Line.X.dup();
  let L2 = new Line([5, 0, 0], Vector.k);
  expect(L1.reflectionIn(new Plane([5, 0, 0], [1, 0, 1])).eql(L2)).toBeTruthy();
  expect(L2.reflectionIn(new Plane([5, 0, 0], [1, 0, 1])).eql(L1)).toBeTruthy();
  expect(
    new Line([-4, 3], [0, -1]).reflectionIn(new Vector([0, 0])).eql(new Line([4, 100], [0, 4])),
  ).toBeTruthy();
});

test('rotate', () => {
  expect(
    Line.X.rotate(Math.PI, new Line([12, 0, 0], [1, 0, 1])).eql(new Line([12, 0, 0], Vector.k)),
  ).toBeTruthy();
  expect(
    new Line([10, 0, 0], [0, 1, 1])
      .rotate(-Math.PI / 2, Line.Y)
      .eql(new Line([0, 0, 10], [1, -1, 0])),
  ).toBeTruthy();
  expect(
    new Line([9, 0], Vector.j)
      .rotate(Math.PI / 2, new Vector([9, 9]))
      .eql(new Line([0, 9], Vector.i)),
  ).toBeTruthy();
});
