import { useObservable } from '@ngneat/react-rxjs';
import React, { FC } from 'react';
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

export const App: FC = () => {
	const [highlightedTrip] = useObservable(tripsSelector.highlightedTrip$);
	const [tripLoading] = useObservable(tripsSelector.tripLoading$);

	return (
		<div className="App">
			<TopBarWrapper>
				<TopBar />
			</TopBarWrapper>
			<MapComponent highlightedTrip={highlightedTrip} />
			{(highlightedTrip || tripLoading) && (
				<PopupWrapper>
					<Popup trip={highlightedTrip} loading={tripLoading.value === 'pending'}></Popup>
				</PopupWrapper>
			)}
		</div>
	);
};

export default App;
