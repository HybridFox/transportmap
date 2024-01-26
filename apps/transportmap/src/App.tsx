import { useObservable } from '@ngneat/react-rxjs';
import React, { FC, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as ol from 'ol';
import { useParams } from 'react-router-dom';

import { i18n } from './services/i18n.service';
import { MapComponent } from './components/Map/Map';
import { Popup } from './components/Popup';
import { tripsSelector } from './store/trips/trips.selectors';
import { TopBar } from './components/TopBar';
import { Head } from './components/Head';
import {stopsRepository} from "./store/stops/stops.repository";

const PopupWrapper = styled.div`
	width: 100%;
	position: fixed;
	bottom: 0;
	padding: 1rem;
	z-index: 1000000;
	pointer-events: none;
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
	const { locale } = useParams();

	const map = useRef<ol.Map | null>(null);

	useEffect(() => {
		i18n.changeLanguage(locale);
	}, [locale])

	useEffect(() => {
		stopsRepository.getStops({});
	}, []);

	return (
		<div className="App">
			<Head />
			<TopBarWrapper>
				<TopBar map={map} />
			</TopBarWrapper>
			<MapComponent highlightedTrip={highlightedTrip} map={map} />
			{(highlightedTrip || tripLoading) && (
				<PopupWrapper>
					<Popup trip={highlightedTrip} loading={tripLoading.value === 'pending'}></Popup>
				</PopupWrapper>
			)}
		</div>
	);
};

export default App;
