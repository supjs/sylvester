import { Plane } from './plane.js';
import { Line } from './line.js';
import { Vector } from './vector.js';
import { expect, test } from 'vitest';

test('eql', () => {
  expect(Plane.XY.dup().eql(new Plane([34, -99, 0], [0, 0, -4]))).toBeTruthy();
  expect(Plane.XY.dup().eql(new Plane([34, -99, 1], [0, 0, -4]))).toBeFalsy();
  expect(Plane.XY.dup().eql(new Plane([34, -99, 0], [1, 0, -4]))).toBeFalsy();
  expect(Plane.XY.dup().eql(new Plane([34, -99, 0], [0, -1, -4]))).toBeFalsy();
});

test('dup', () => {
  let P = Plane.XY.dup();
  P.anchor.setElements([3, 4, 5]);
  P.normal.setElements([0, 2, 6]);
  expect(Plane.XY.anchor.eql([0, 0, 0])).toBeTruthy();
  expect(Plane.XY.normal.eql(Vector.k)).toBeTruthy();
});

test('translate', () => {
  expect(Plane.XY.translate([5, 12, -14]).eql(new Plane([89, -34, -14], Vector.k))).toBeTruthy();
  expect(Plane.XY.anchor.eql(Vector.Zero(3))).toBeTruthy();
});

test('isParallelTo', () => {
  expect(Plane.XY.dup().translate([5, 12, -14]).isParallelTo(Plane.XY)).toBeTruthy();
  expect(Plane.XY.isParallelTo(new Line([4, 8, 10], [2, -6, 0]))).toBeTruthy();
});

test('distanceFrom', () => {
  expect(14).toEqual(Plane.XY.dup().translate([5, 12, -14]).distanceFrom(Plane.XY));
  expect(0).toEqual(
    Plane.XY.dup()
      .translate([5, 12, -14])
      .distanceFrom(new Plane([0, 0, 0], [1, 0, 1])),
  );
  expect(10).toEqual(Plane.XY.distanceFrom(new Line([4, 8, 10], [2, -6, 0])));
  expect(0).toEqual(Plane.XY.distanceFrom(new Line([4, 8, 10], [2, -6, 2])));
});

test('contains', () => {
  expect(Plane.XY.contains(Line.X)).toBeTruthy();
  expect(Plane.XY.contains(Vector.i)).toBeTruthy();
});

test('pointClosestTo', () => {
  expect(Plane.YZ.pointClosestTo([3, 6, -3]).eql([0, 6, -3])).toBeTruthy();
});

test('rotate', () => {
  expect(Plane.XY.rotate(Math.PI / 2, Line.Y).eql(Plane.YZ)).toBeTruthy();
});

test('reflectionIn', () => {
  expect(
    Plane.XY.reflectionIn(new Vector([12, 65, -4])).eql(new Plane([0, 0, -8], Vector.k)),
  ).toBeTruthy();
  expect(Plane.XY.reflectionIn(Line.Z).eql(Plane.XY)).toBeTruthy();
  expect(Plane.XY.reflectionIn(new Line([0, 0, 0], [1, 0, 1])).eql(Plane.YZ)).toBeTruthy();
  expect(
    new Plane([5, 0, 0], [1, 1, 0])
      .reflectionIn(new Plane([5, 0, 0], [0, 1, 0]))
      .eql(new Plane([5, 0, 0], [-1, 1, 0])),
  ).toBeTruthy();
  expect(
    new Plane([0, 5, 0], [0, 1, 1])
      .reflectionIn(new Plane([0, 5, 0], [0, 0, 1]))
      .eql(new Plane([0, 5, 0], [0, -1, 1])),
  ).toBeTruthy();
  expect(
    new Plane([0, 0, 5], [1, 0, 1])
      .reflectionIn(new Plane([0, 0, 5], [1, 0, 0]))
      .eql(new Plane([0, 0, 5], [1, 0, -1])),
  ).toBeTruthy();
});

test('containment', () => {
  let i, P1, P2, L1, L2;
  for (i = 0; i < 10; i++) {
    P1 = new Plane(
      new Vector([-50, -50, -50]).add(Vector.Random(3).x(100)),
      new Vector([-50, -50, -50]).add(Vector.Random(3).x(100)),
    );
    P2 = new Plane(
      new Vector([-50, -50, -50]).add(Vector.Random(3).x(100)),
      new Vector([-50, -50, -50]).add(Vector.Random(3).x(100)),
    );
    if (P1.intersects(P2)) {
      L1 = P1.intersectionWith(P2);
      L2 = P2.intersectionWith(P1);
      expect(L1.eql(L2)).toBeTruthy();
      expect(L1.liesIn(P1)).toBeTruthy();
      expect(P2.contains(L1)).toBeTruthy();
    }
  }
});
