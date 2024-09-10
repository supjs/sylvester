import { getPrecision } from './precision.js';
import { Vector } from './vector.js';

export class PolygonVertex extends Vector {
  constructor(point) {
    super(point);
    if (this.elements.length === 2) {
      this.elements.push(0);
    }
    if (this.elements.length !== 3) {
      return null;
    }
  }

  // Method for converting a set of arrays/vectors/whatever to a set of Sylvester.Polygon.Vertex objects
  static convert = function (points) {
    let pointSet = points.toArray ? points.toArray() : points;
    let list = [],
      n = pointSet.length;
    for (let i = 0; i < n; i++) {
      list.push(new PolygonVertex(pointSet[i]));
    }
    return list;
  };

  // Returns true iff the vertex's internal angle is 0 <= x < 180
  // in the context of the given polygon object. Returns null if the
  // vertex does not exist in the polygon.
  isConvex(polygon) {
    let node = polygon.nodeFor(this);
    if (node === null) {
      return null;
    }
    let prev = node.prev.data,
      next = node.next.data;
    let A = next.subtract(this);
    let B = prev.subtract(this);
    let theta = A.angleFrom(B);
    if (theta <= getPrecision) {
      return true;
    }
    if (Math.abs(theta - Math.PI) <= getPrecision()) {
      return false;
    }
    return A.cross(B).dot(polygon.plane.normal) > 0;
  }

  // Returns true iff the vertex's internal angle is 180 <= x < 360
  isReflex(polygon) {
    let result = this.isConvex(polygon);
    return result === null ? null : !result;
  }

  type(polygon) {
    let result = this.isConvex(polygon);
    return result === null ? null : result ? 'convex' : 'reflex';
  }
}
