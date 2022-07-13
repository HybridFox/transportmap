import { EntityState, createEntityStore } from '@datorama/akita';

import { VEHICLE_FILTER, VehicleModel } from './vehicle.model';

export interface VehicleState extends EntityState<VehicleModel, string> {
	ui: {
		filter: VEHICLE_FILTER;
	};
}

const initialState = {
	ui: { filter: VEHICLE_FILTER.SHOW_ALL },
};

export const vehicleStore = createEntityStore<VehicleState>(initialState, {
	name: 'vehicles',
	idKey: 'lineId',
});
