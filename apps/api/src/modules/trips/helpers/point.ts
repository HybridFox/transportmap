export function interpolatePoint(flatCoordinates, offset, end, stride, fraction, dest, dimension) {
	let o, t;
	const n = (end - offset) / stride;
	if (n === 1) {
		o = offset;
	} else if (n === 2) {
		o = offset;
		t = fraction;
	} else if (n !== 0) {
		let x1 = flatCoordinates[offset];
		let y1 = flatCoordinates[offset + 1];
		let length = 0;
		const cumulativeLengths = [0];
		for (let i = offset + stride; i < end; i += stride) {
			const x2 = flatCoordinates[i];
			const y2 = flatCoordinates[i + 1];
			length += Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
			cumulativeLengths.push(length);
			x1 = x2;
			y1 = y2;
		}
		const target = fraction * length;
		const index = binarySearch(cumulativeLengths, target);
		if (index < 0) {
			t = (target - cumulativeLengths[-index - 2]) / (cumulativeLengths[-index - 1] - cumulativeLengths[-index - 2]);
			o = offset + (-index - 2) * stride;
		} else {
			o = offset + index * stride;
		}
	}
	dimension = dimension > 1 ? dimension : 2;
	dest = dest ? dest : new Array(dimension);
	for (let i = 0; i < dimension; ++i) {
		dest[i] = o === undefined ? NaN : t === undefined ? flatCoordinates[o + i] : lerp(flatCoordinates[o + i], flatCoordinates[o + stride + i], t);
	}
	return dest;
}

export function lerp(a, b, x) {
	return a + x * (b - a);
}

export function ascending(a, b) {
	return a > b ? 1 : a < b ? -1 : 0;
}

export function binarySearch(haystack, needle, comparator?: any) {
	let mid, cmp;
	comparator = comparator || ascending;
	let low = 0;
	let high = haystack.length;
	let found = false;

	while (low < high) {
		/* Note that "(low + high) >>> 1" may overflow, and results in a typecast
		 * to double (which gives the wrong results). */
		mid = low + ((high - low) >> 1);
		cmp = +comparator(haystack[mid], needle);

		if (cmp < 0.0) {
			/* Too low. */
			low = mid + 1;
		} else {
			/* Key found or too high */
			high = mid;
			found = !cmp;
		}
	}

	/* Key not found. */
	return found ? low : ~low;
}
