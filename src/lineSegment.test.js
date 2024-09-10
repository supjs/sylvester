import { expect, test } from 'vitest';
import { LineSegment } from './lineSegment.js';
import { Line } from './line.js';
import { Plane } from './plane.js';
import { getPrecision } from './precision.js';

const createSegments = () => {
  return {
    segment: new LineSegment([5, 5, 5], [10, 10, 10]),
    segment2: new LineSegment([1, 1, 0], [1, 2, 0]),
  };
};

test('eql', () => {
  const { segment, segment2 } = createSegments();
  expect(segment.eql(segment)).toBeTruthy();
  expect(segment.eql(segment2)).toBeFalsy();
  expect(segment.eql(new LineSegment(segment.end, segment.start))).toBeTruthy();
});

test('dup', () => {
  const { segment } = createSegments();
  let seg = segment.dup();
  expect(segment.eql(seg)).toBeTruthy();
  seg.start.setElements([23, 87, 56]);
  expect(segment.eql(seg)).toBeFalsy();
  expect(segment.start.eql([5, 5, 5])).toBeTruthy();
});

test('length()', () => {
  const { segment } = createSegments();
  expect(segment.length() - Math.sqrt(75) <= getPrecision()).toBeTruthy();
});

test('toVector', () => {
  const { segment } = createSegments();
  expect(segment.toVector().eql([5, 5, 5])).toBeTruthy();
});

test('midpoint', () => {
  const { segment } = createSegments();
  expect(segment.midpoint().eql([7.5, 7.5, 7.5])).toBeTruthy();
});

test('bisectingPlane', () => {
  const { segment } = createSegments();
  expect(segment.bisectingPlane().eql(new Plane([7.5, 7.5, 7.5], [1, 1, 1]))).toBeTruthy();
});

test('translate', () => {
  const { segment } = createSegments();
  expect(segment.translate([9, 2, 7]).eql(new LineSegment([14, 7, 12], [19, 12, 17]))).toBeTruthy();
});

test('isParallelTo', () => {
  const { segment, segment2 } = createSegments();
  expect(segment2.isParallelTo(Line.Y)).toBeTruthy();
  expect(segment2.isParallelTo(Line.Z)).toBeFalsy();
  expect(segment2.isParallelTo(Plane.XY)).toBeTruthy();
  expect(segment2.isParallelTo(Plane.YZ)).toBeTruthy();
  expect(segment2.isParallelTo(Plane.ZX)).toBeFalsy();
  expect(segment.isParallelTo(segment2)).toBeFalsy();
  expect(segment2.isParallelTo(segment2)).toBeTruthy();
});

test('contains', () => {
  const { segment, segment2 } = createSegments();
  expect(segment.contains(segment.midpoint())).toBeTruthy();
  expect(segment.contains([5, 5, 5])).toBeTruthy();
  expect(segment.contains([10, 10, 10])).toBeTruthy();
  expect(segment.contains([4.9999, 4.9999, 4.9999])).toBeFalsy();
  expect(segment.contains([10.00001, 10.00001, 10.00001])).toBeFalsy();
  expect(segment.contains(new LineSegment([5, 5, 5], [8, 8, 8]))).toBeTruthy();
  expect(segment.contains(new LineSegment([7, 7, 7], [10, 10, 10]))).toBeTruthy();
  expect(segment.contains(new LineSegment([4, 4, 4], [8, 8, 8]))).toBeFalsy();
});

test('distanceFrom', () => {
  const { segment, segment2 } = createSegments();
  expect(5).toEqual(segment.distanceFrom([5, 5, 0]));
  expect(2).toEqual(segment.distanceFrom([10, 12, 10]));
  expect(Math.sqrt(2 * 25)).toEqual(segment.distanceFrom(Line.X));
  expect(1).toEqual(segment.distanceFrom(new Line([11, 10, 10], [0, 1])));
  expect(5).toEqual(segment.distanceFrom(Plane.XY));
  expect(Math.sqrt(4 + 25 + 25)).toEqual(
    segment.distanceFrom(new LineSegment([7, 0, 0], [9, 0, 0])),
  );
});

test('intersection', () => {
  const { segment, segment2 } = createSegments();
  expect(segment.intersects(Line.X)).toBeFalsy();
  expect(segment.intersects(Line.Y)).toBeFalsy();
  expect(segment.intersects(Line.Z)).toBeFalsy();
  expect(segment.intersects(Plane.XY)).toBeFalsy();
  expect(segment.intersects(Plane.YZ)).toBeFalsy();
  expect(segment.intersects(Plane.ZX)).toBeFalsy();
  expect(segment.intersectionWith(segment.bisectingPlane()).eql(segment.midpoint())).toBeTruthy();
  expect(
    new LineSegment([0, 4, 4], [0, 8, 4])
      .intersectionWith(new LineSegment([0, 6, 2], [0, 6, 6]))
      .eql([0, 6, 4]),
  ).toBeTruthy();
  expect(
    new LineSegment([0, 4, 4], [0, 8, 4]).intersectionWith(new LineSegment([2, 6, 2], [0, 6, 6])),
  ).toBeNull();
  expect(segment.intersects(new LineSegment([6, 7, 7], [9, 7, 7]))).toBeTruthy();
  expect(segment.intersects(segment2)).toBeFalsy();
});

test('pointClosestTo', () => {
  const { segment2 } = createSegments();
  expect(segment2.pointClosestTo(Line.Y)).toBeNull();
  expect(segment2.pointClosestTo(Line.X).eql([1, 1, 0])).toBeTruthy();
  expect(segment2.pointClosestTo(Line.X.translate([0, 10])).eql([1, 2, 0])).toBeTruthy();
  expect(segment2.pointClosestTo(new Line([0, 1.5, 0], [0, 0, 1])).eql([1, 1.5, 0])).toBeTruthy();
  expect(segment2.pointClosestTo(Plane.XZ).eql([1, 1, 0])).toBeTruthy();
  expect(segment2.pointClosestTo(Plane.YZ)).toBeNull();
});
