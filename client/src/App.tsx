import { useObservable } from '@ngneat/react-rxjs';
import React, { FC } from 'react';
import { Observable } from 'rxjs';
import styled from 'styled-components';

import { MapComponent } from './components/Map/Map';
import { Popup } from './components/Popup';
import { tripsSelector } from './store/vehicles/trips.selectors';

const PopupWrapper = styled.div`
	width: 100%;
	position: fixed;
	bottom: 0;
	padding: 1rem;
	z-index: 1000000;
`;

export const App: FC<any> = () => {
	// const [vehicleLoading] = useObservable(vehicleQuery.selectLoading());
	const [trip] = useObservable(tripsSelector.activeTrip$);

	return (
		<div className="App">
			<MapComponent />
			{trip && (
				<PopupWrapper>
					<Popup trip={trip}></Popup>
				</PopupWrapper>
			)}
		</div>
	);
};

export default App;
