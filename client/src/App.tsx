import { useObservable } from '@ngneat/react-rxjs';
import React, { FC, useState } from 'react';
import { Observable } from 'rxjs';
import styled from 'styled-components';

import { MapComponent } from './components/Map/Map';
import { Popup } from './components/Popup';
import { tripsSelector } from './store/trips/trips.selectors';
import { TopBar } from './components/TopBar';

const PopupWrapper = styled.div`
	width: 100%;
	position: fixed;
	bottom: 0;
	padding: 1rem;
	z-index: 1000000;
`;

const TopBarWrapper = styled.div`
	width: 100%;
	position: fixed;
	top: 0;
	padding: 1rem;
	z-index: 1000000;
`;

export const App: FC<any> = () => {
	// const [vehicleLoading] = useObservable(vehicleQuery.selectLoading());
	const [trip] = useObservable(tripsSelector.activeTrip$);
	const [userLocation, setUserLocation] = useState<null | number[]>(null);

	return (
		<div className="App">
			<TopBarWrapper>
				<TopBar setUserLocation={setUserLocation} />
			</TopBarWrapper>
			<MapComponent userLocation={userLocation} activeTrip={trip} />
			{trip && (
				<PopupWrapper>
					<Popup trip={trip}></Popup>
				</PopupWrapper>
			)}
		</div>
	);
};

export default App;
