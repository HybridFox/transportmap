import React, { FC, useState } from 'react';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import { useObservable } from '@ngneat/react-rxjs';
import * as ol from 'ol';
import * as olProj from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { tripsRepository } from '../store/trips/trips.repository';
import { searchRepository } from '../store/search/search.repository';
import { uiRepository } from '../store/ui/ui.repository';
import { getTranslation } from '../helpers/translation.util';

import { Badge } from './Badge';

const LocationIcon = styled.button<{ enabled: boolean }>`
	padding: 1rem 1.5rem;
	border-radius: 20px;
	background-color: ${(props) => props.enabled ? props.theme.main.success : '#161616'};
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	border: none;
	color: white;
	align-self: flex-start;
	margin-right: 0.5rem;
	cursor: pointer;
`;

const LanguageIcon = styled.button<{ visible: boolean }>`
	padding: 1rem 1.5rem;
	border-radius: 20px;
	background-color: ${(props) => props.visible ? props.theme.main.success : '#161616'};
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	border: none;
	color: white;
	align-self: flex-start;
	text-transform: uppercase;
	font-weight: bold;
	margin-right: 0.5rem;
	cursor: pointer;
`;

const LanguageWrapper = styled.div`
	position: relative;
`;

const LanguageContainer = styled.div`
	margin-top: 0.5rem;
	background: rgb(33, 33, 33);
	border-radius: 20px;
	margin-right: 0.5rem;

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 0.5rem 0;

		li {
			padding: 0.25rem 0;
			font-weight: bold;
			color: #FFF;
			text-transform: uppercase;
			cursor: pointer;
		}
	}
`;

const SearchBarContainer = styled.div`
	flex: 1;
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

const availableLanguages = ['nl', 'fr', 'en', 'de'];

const RawTopBar: FC<Props> = ({ className, map }: Props) => {
	const [searchResults] = useObservable(searchRepository.searchResults$);
	const [userLocationEnabled] = useObservable(uiRepository.userLocationEnabled$);
	const [t, i18n] = useTranslation();
	const navigate = useNavigate();
	const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);

	const doSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		searchRepository.searchTrips({ q: e.target.value })
	}

	const changeLanguage = (lang: string) => {
		setLanguageDropdownVisible(false);
		i18n.changeLanguage(lang);
		navigate(`/${lang}`)
	}

	return (
		<div className={className}>
			<LanguageWrapper>
				<LanguageIcon visible={languageDropdownVisible} onClick={() => setLanguageDropdownVisible(!languageDropdownVisible)}>
					{i18n.language}
				</LanguageIcon>
				{languageDropdownVisible && (
					<LanguageContainer>
						<ul>
							{availableLanguages.map((langKey) => (
								<li key={langKey} onClick={() => changeLanguage(langKey)}>{langKey}</li>
							))}
						</ul>
					</LanguageContainer>
				)}
			</LanguageWrapper>
			<LocationIcon enabled={userLocationEnabled} onClick={() => uiRepository.setUserLocationEnabled(!userLocationEnabled)}>
				<span className="uil uil-location-arrow"></span>
			</LocationIcon>
			<SearchBarContainer>
				<SearchBar type="text" onChange={debounce(doSearch, 300)} placeholder={t('GENERAL.SEARCH_TRIP_OR_STOP')!} />
				{!!searchResults?.trips.length && (
					<SearchResultsContainer>
						<SearchResultName>{t('GENERAL.TRIPS')}</SearchResultName>
						{searchResults?.trips.map((trip) => (
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
					<SearchResultName>{t('GENERAL.STOPS')}</SearchResultName>
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
									{getTranslation(stop.translations, i18n.language)}
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
