import React, { FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { Badge } from './Badge';
import { NextStops } from './NextStops';
import { Composition } from './Composition';
import { tripsService } from '../services/vehicle.service';
import debounce from 'lodash.debounce';
import { useObservable } from '@ngneat/react-rxjs';
import { tripsSelector } from '../store/trips/trips.selectors';
import { tripsRepository } from '../store/trips/trips.repository';
import { searchSelector } from '../store/search/search.selectors';
import { searchRepository } from '../store/search/search.repository';

const LocationIcon = styled.button`
	padding: 1rem 1.5rem;
	border-radius: 20px;
	background-color: #161616;
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	border: none;
	color: white;
	align-self: flex-start;
	/* border: 3px solid rgb(220, 220, 220); */
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
	/* border: 3px solid rgb(220, 220, 220); */
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
	setUserLocation: (location: number[]) => void;
	className?: string;
}

const RawTopBar: FC<Props> = ({ className, setUserLocation }: Props) => {
	const [searchValue, setSearchValue] = useState<string>();
	const [searchResults] = useObservable(searchRepository.searchResults$);
	
	// useEffect(() => {
	// 	console.log('get', searchValue)
	// 	// tripsService.get({})
	// }, [searchValue]);

	const doSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		searchRepository.searchTrips({ q: e.target.value })
	}

	return (
		<div className={className}>
			<LocationIcon onClick={() => {
				navigator.geolocation && navigator.geolocation.getCurrentPosition((position) => {
					setUserLocation([position.coords.longitude, position.coords.latitude])
				}, (err) => {
					console.error(err)
				});
			}}><span className="uil uil-location-arrow"></span></LocationIcon>
			<SearchBarContainer>
				<SearchBar type="text" onChange={debounce(doSearch, 100)} />
				<TripContainer>
					{searchResults.map((trip) => (
						<Trip onClick={() => {
							searchRepository.clear()
							tripsRepository.getTrip(trip.id);
						}}>
							<Badge
								color={trip?.extraData?.foregroundColor}
								borderColor={trip?.extraData?.backgroundBorderColor}
								backgroundColor={trip?.extraData?.backgroundColor}>
								{trip.route.routeCode.replaceAll(/[0-9]/g, '')}{trip.name}
							</Badge>
							<p>
								{trip.headsign}
							</p>
						</Trip>
					))}
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
