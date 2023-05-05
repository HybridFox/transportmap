// import { BoundingBox } from './mapHelpers.types';

const getPoints = (point1: number, point2: number, num: number): number[] => {
	const d0 = (point2 - point1) / num;
	const points: number[] = [];

	for (let i = 0; i <= num; i++) {
		points.push(point1 + d0 * i);
	}

	return points;
};

// export const splitBoundingBox = ({ north, east, south, west }: BoundingBox): BoundingBox[] => {
// 	const horizontalPoints = getPoints(west, east, 7);
// 	const verticalPoints = getPoints(south, north, 7);

// 	const result: BoundingBox[] = [];

// 	for (let vPos = 0; vPos < verticalPoints.length - 1; vPos++) {
// 		for (let hPos = 0; hPos < horizontalPoints.length - 1; hPos++) {
// 			result.push({
// 				north: verticalPoints[vPos + 1],
// 				west: horizontalPoints[hPos],
// 				south: verticalPoints[vPos],
// 				east: horizontalPoints[hPos + 1],
// 			});
// 		}
// 	}

// 	return result;
// };

const sqr = (x: number): number => {
	return x * x;
};

const dist2 = (v: { x: number; y: number }, w: { x: number; y: number }) => {
	return sqr(v.x - w.x) + sqr(v.y - w.y);
};

const distToSegmentSquared = (p: { x: number; y: number }, v: { x: number; y: number }, w: { x: number; y: number }) => {
	const l2 = dist2(v, w);
	if (l2 == 0) return dist2(p, v);
	let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
	t = Math.max(0, Math.min(1, t));
	return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
};

export const distToSegment = (p: { x: number; y: number }, v: { x: number; y: number }, w: { x: number; y: number }) => {
	return Math.sqrt(distToSegmentSquared(p, v, w));
};

export const projectToLine = (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
	const atob = { x: b.x - a.x, y: b.y - a.y };
	const atop = { x: p.x - a.x, y: p.y - a.y };
	const len = atob.x * atob.x + atob.y * atob.y;
	let dot = atop.x * atob.x + atop.y * atob.y;
	const t = Math.min(1, Math.max(0, dot / len));

	dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

	return {
		point: {
			x: a.x + atob.x * t,
			y: a.y + atob.y * t,
		},
		left: dot < 1,
		dot: dot,
		t: t,
	};
};
