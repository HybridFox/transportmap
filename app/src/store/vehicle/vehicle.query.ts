import { createEntityQuery } from '@datorama/akita';

import { VehicleState, vehicleStore } from './vehicle.store';

export const vehicleQuery = createEntityQuery<VehicleState>(vehicleStore);

export const selectVisibilityFilter$ = vehicleQuery.select((state) => state.ui.filter);

// export const selectVehicles$ = combineLatest(
// 	selectVisibilityFilter$,
// 	vehicleQuery.selectAll(),
// 	function getVisibleTodos(filter, todos): TodoModel[] {
// 		switch (filter) {
// 			case 'SHOW_COMPLETED':
// 				return todos.filter((t) => t.completed);
// 			case 'SHOW_ACTIVE':
// 				return todos.filter((t) => !t.completed);
// 			default:
// 				return todos;
// 		}
// 	},
// );
