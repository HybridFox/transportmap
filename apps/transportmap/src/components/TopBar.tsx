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
	border-radius: 20px;
`;

const SearchBar = styled.input`
	padding: 1rem 1.5rem;
	border-radius: 20px;
	background-color: rgb(22, 22, 22);
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	border: none;
	color: white;
	width: 100%;
	border: none;
`;

const SearchResultsContainer = styled.div`
	margin-top: 0.5rem;
	background: rgb(33, 33, 33);
	border-radius: 20px;
`;

const SearchResult = styled.div`
	display: flex;
	padding: 0 1rem 1rem 1rem;
	cursor: pointer;
	
	p {
		margin: 0;
		padding: 0;
	}
`;

const SearchResultName = styled.p`
	display: flex;
	padding: 0.5rem 1rem;
	text-transform: uppercase;
	font-weight: bold;
	font-size: .8rem;
	margin: 0;
	cursor: pointer;
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
				{!!searchResults?.trips.length && (
					<SearchResultsContainer>
						<SearchResultName>Trips</SearchResultName>
						{searchResults?.trips.map((trip) => console.log(trip) as any || (
							<SearchResult onClick={() => {
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
								<Badge>
									{trip.route.routeCode} {trip.name}
								</Badge>
								<p>
									{trip.route.name}
								</p>
							</SearchResult>
						))}
					</SearchResultsContainer>
				)}
				{!!searchResults?.stops.length && (
					<SearchResultsContainer>
					<SearchResultName>Stops</SearchResultName>
						{searchResults?.stops.map((stop) => (
							<SearchResult onClick={() => {
								searchRepository.clear()
								map.current!
									.getView()
									.animate({ center: olProj.transform([
										stop.longitude,
										stop.latitude
									], 'EPSG:4326', 'EPSG:3857'), zoom: 15 });
							}}>
								<p>
									{stop.name}
								</p>
							</SearchResult>
						))}
					</SearchResultsContainer>
				)}
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
