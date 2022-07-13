import ky from 'ky';

import { VehicleModel } from './vehicle.model';
import { vehicleStore } from './vehicle.store';

// export const updateTodosFilter = (filter: VEHICLE_FILTER): void => {
// 	vehicleStore.update({
// 		ui: {
// 			filter,
// 		},
// 	});
// };
export const fetchVehicles = (searchParams: Record<string, string | number>): void => {
	ky.get('http://localhost:3001/api/v1/vehicles', {
		searchParams,
	})
		.json<VehicleModel[]>()
		.then((vehicles) => {
			vehicleStore.upsertMany(vehicles);
		});
};

export const fetchVehicle = (vehicleId: string): void => {
	vehicleStore.setLoading(true);
	vehicleStore.setActive(vehicleId);
	ky.get(`http://localhost:3001/api/v1/vehicles/${vehicleId}`)
		.json<VehicleModel>()
		.then((vehicle) => {
			vehicleStore.upsert(vehicleId, vehicle);
			vehicleStore.setLoading(false);
		});
};

export const clearVehicle = (): void => {
	vehicleStore.setActive(null);
};

// export function deleteTodo(id: string) {
// 	vehicleStore.remove(id);
// }
