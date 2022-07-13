import React, { FC } from 'react';
import { useObservable } from 'react-use-observable';
import { Observable } from 'rxjs';
import styled from 'styled-components';

import { MapComponent } from './components/Map/Map';
import { Popup } from './components/Popup';
import { vehicleQuery } from './store/vehicle/vehicle.query';
import { VehicleModel } from './store/vehicle/vehicle.model';

const PopupWrapper = styled.div`
	width: 100%;
	position: fixed;
	bottom: 0;
	padding: 1rem;
	z-index: 1000000;
`;

export const App: FC<any> = () => {
	// const [vehicleLoading] = useObservable(vehicleQuery.selectLoading());
	const [vehicle] = useObservable(() => vehicleQuery.selectActive() as Observable<VehicleModel>, []);

	return (
		<div className="App">
			<MapComponent />
			{vehicle && (
				<PopupWrapper>
					<Popup vehicle={vehicle}></Popup>
				</PopupWrapper>
			)}
		</div>
	);
};

export default App;
