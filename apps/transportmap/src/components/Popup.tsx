import React, { FC, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Trip } from '../store/trips/trips.types';

import { Badge } from './Badge';
import { NextStops } from './NextStops';
import { Composition } from './Composition';

interface PopupProps {
	trip?: Trip;
	loading?: boolean;
	className?: string;
}

const PopupHeader = styled.div`
	padding: 1rem 1.5rem 0 1.5rem;
	background-color: #161616;

	h2 {
		margin: 0;
		color: #eeeeee;
	}
`;

const PopupBody = styled.div`
	padding: 1rem 1.5rem;
`;

const Title = styled.div`
	display: flex;
	align-items: center;
`;

const Tabs = styled.div`
	display: flex;
	border-bottom: 1px solid #292929;
`;

const Tab = styled.button<{
	selected: boolean;
}>`
	border: none;
	background: none;
	font-family: 'Prompt', sans-serif;
	padding: 1rem;
	color: #bdbdbd;
	transition: all 0.2s ease;
	border-bottom: 2px solid transparent;
	cursor: pointer;
	margin-bottom: -1px;

	&:hover {
		color: #e0e0e0;
		border-bottom: 2px solid #d8d8d8;
	}

	${(props) =>
		props.selected &&
		css`
			color: #ffffff;
			border-bottom: 2px solid #ececec;
		`}
`;

const PopupLoading = styled.div`
	color: #bdbdbd;
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	max-width: 1280px;
	background-color: #0e0e0e;
	margin: 0 auto;
	border-radius: 20px;
	overflow: hidden;
	min-height: 240px;
	display: flex;
	align-items: center;
	justify-content: center;
`

const RawPopup: FC<PopupProps> = ({ trip, className, loading }: PopupProps) => {
	const [selectedTab, setSelectedTab] = useState<string>('next-stops');
	const [t] = useTranslation()

	if (loading) {
		return (<PopupLoading>
			<span className="uil uil-sync animate spin-reverse"></span>
		</PopupLoading>)
	}

	if (!trip) {
		return <></>
	}

	return (
		<div className={className}>
			<PopupHeader>
				<Title>
					<Badge
						color={trip?.extraData?.foregroundColor}
						borderColor={trip?.extraData?.backgroundBorderColor}
						backgroundColor={trip?.extraData?.backgroundColor}>
						{trip.route.routeCode} {trip.name}
					</Badge>
					<h2>
						{trip.headsign}
					</h2>
				</Title>
				<Tabs>
					{/* <Tab onClick={() => setSelectedTab('info')} selected={selectedTab === 'info'}>
						Info
					</Tab> */}
					<Tab onClick={() => setSelectedTab('next-stops')} selected={selectedTab === 'next-stops'}>
						{t('GENERAL.NEXT_STOPS')}
					</Tab>
					<Tab onClick={() => setSelectedTab('composition')} selected={selectedTab === 'composition'}>
						{t('GENERAL.COMPOSITION')}
					</Tab>
				</Tabs>
			</PopupHeader>
			<PopupBody>
				{selectedTab === 'next-stops' && <NextStops trip={trip}></NextStops>}
				{selectedTab === 'composition' && <Composition trip={trip}></Composition>}
			</PopupBody>
		</div>
	);
};

export const Popup = styled(RawPopup)`
	color: #bdbdbd;
	box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	max-width: 1280px;
	background-color: #0e0e0e;
	margin: 0 auto;
	border-radius: 20px;
	overflow: hidden;
	min-height: 240px;
	pointer-events: all;
`;
