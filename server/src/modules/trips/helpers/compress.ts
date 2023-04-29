interface Route {
	id: string;
	agencyId: string;
	routeCode: string;
	name: string;
	description: string;
	type: string;
	url: string;
	color: string;
	textColor: string;
}

interface Section {
	type: string;
	startTime: string;
	endTime: string;
	realtimeStartTime: any;
	realtimeEndTime: any;
	startLocation: Location;
	endLocation: Location;
	distance: number;
	bearing: number;
	speed: number;
	index: number;
}

interface Location {
	latitude: number;
	longitude: number;
}

interface Trip {
	osrmRoute: string[];
	route: Route;
	section: Section[];
	id: string;
}

const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

export const compressKeys = (data: any, keyMap: Record<string, string> = {}, availableKeys: string[] = keys) => {
	if (data && typeof data === 'object' && !Array.isArray(data)) {
		return Object.keys(data).reduce((acc, originalKey) => {
			const existingKey = keyMap[originalKey];

			if (!existingKey) {
				const [newKey] = availableKeys.splice(0, 1);
				keyMap[originalKey] = newKey;

				return {
					...acc,
					[newKey]: compressKeys(data[originalKey], keyMap, availableKeys),
				};
			}

			return {
				...acc,
				[existingKey]: compressKeys(data[originalKey], keyMap, availableKeys),
			};
		}, {});
	}

	if (data && typeof data === 'object' && Array.isArray(data)) {
		return data.map((value) => compressKeys(value, keyMap, availableKeys));
	}

	return data;
};
