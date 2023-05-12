import React, { FC } from 'react';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import { useObservable } from '@ngneat/react-rxjs';
import * as ol from 'ol';
import * as olProj from 'ol/proj';

import { tripsRepository } from '../store/trips/trips.repository';
import { searchRepository } from '../store/search/search.repository';
import { uiRepository } from '../store/ui/ui.repository';

import { Badge } from './Badge';

const LocationIcon = styled.button<{ enabled: boolean }>`
	padding: 1rem 1.5rem;
	border-radius: 20px;
	background-color: ${(props) => props.enabled ? '#98D8AA' : '#161616'};
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	border: none;
	color: white;
	align-self: flex-start;
	cursor: pointer;
`;

const SearchBarContainer = styled.div`
	flex: 1;
	margin-left: 1rem;
	background: rgb(84, 84, 84);
	border-radius: 20px;
`;

const SearchBar = styled.input`
	padding: 1rem 1.5rem;
	border-radius: 20px;
	background-color: #161616;
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	border: none;
	color: white;
	width: 100%;
	border: none;
`;

const TripContainer = styled.div`
	background: rgb(84, 84, 84);
	border-radius: 20px;
`;

const Trip = styled.div`
	display: flex;
	padding: 1rem;
	cursor: pointer;
	
	p {
		margin: 0;
		padding: 0;
	}
`;

interface Props {
	className?: string;
	map: React.MutableRefObject<ol.Map | null>;
}

const RawTopBar: FC<Props> = ({ className, map }: Props) => {
	const [searchResults] = useObservable(searchRepository.searchResults$);
	const [userLocationEnabled] = useObservable(uiRepository.userLocationEnabled$)

	const doSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		searchRepository.searchTrips({ q: e.target.value })
	}

	return (
		<div className={className}>
			<LocationIcon enabled={userLocationEnabled} onClick={() => uiRepository.setUserLocationEnabled(!userLocationEnabled)}>
				<span className="uil uil-location-arrow"></span>
			</LocationIcon>
			<SearchBarContainer>
				<SearchBar type="text" onChange={debounce(doSearch, 300)} placeholder='Search for a trip' />
				<TripContainer>
					{searchResults?.trips.map((trip: any) => (
						<Trip onClick={() => {
							searchRepository.clear()
							tripsRepository.highlightTrip(trip.id)
								.then((trip) => {
									map.current!
										.getView()
										.animate({ center: olProj.transform([
											trip.sectionLocation.longitude,
											trip.sectionLocation.latitude
										], 'EPSG:4326', 'EPSG:3857'), zoom: 13.5 });
								});
							
						}}>
							<Badge
								color={trip?.extraData?.foregroundColor}
								borderColor={trip?.extraData?.backgroundBorderColor}
								backgroundColor={trip?.extraData?.backgroundColor}>
								{trip.route.routeCode} {trip.name}
							</Badge>
							<p>
								{trip.headsign}
							</p>
						</Trip>
					))}
					{/* {searchResults?.stops.map((stop: any) => (
						<Trip onClick={() => {
							searchRepository.clear()
							tripsRepository.getTrip(trip.id);
						}}>
							<Badge
								color={trip?.extraData?.foregroundColor}
								borderColor={trip?.extraData?.backgroundBorderColor}
								backgroundColor={trip?.extraData?.backgroundColor}>
								{trip.route.routeCode} {trip.name}
							</Badge>
							<p>
								{trip.headsign}
							</p>
						</Trip>
					))} */}
				</TripContainer>
			</SearchBarContainer>
		</div>
	);
};

export const TopBar = styled(RawTopBar)`
	color: #bdbdbd;
	max-width: 1280px;
	margin: 0 auto;
	overflow: hidden;

	display: flex;
`;
