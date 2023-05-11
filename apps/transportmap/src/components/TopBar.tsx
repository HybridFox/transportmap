import React, { FC } from 'react';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import { useObservable } from '@ngneat/react-rxjs';

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
}

const RawTopBar: FC<Props> = ({ className }: Props) => {
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
				<SearchBar type="text" onChange={debounce(doSearch, 500)} placeholder='Search for a trip' />
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
								{trip.route.routeCode} {trip.name}
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
