/* eslint-disable indent */
import { StopOver } from 'hafas-client';
import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import dayjs from 'dayjs';
import Scrollbars from 'react-custom-scrollbars-2';

import { VehicleModel } from '../store/vehicle/vehicle.model';

interface PopupProps {
	vehicle: VehicleModel;
	className?: string;
}

const Stops = styled.div`
	display: flex;
`;

const Stop = styled.div<{
	isPassed: boolean;
}>`
	position: relative;
	padding-right: 2rem;
	padding-top: 2rem;
	width: 200%;

	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		height: 15px;
		width: 15px;
		background-color: ${(props) => (props.isPassed ? '#6ab04c' : '#FFF')};
		border-radius: 50%;
	}

	p {
		margin: 0;
		font-size: 0.9rem;
		white-space: nowrap;
	}

	h4 {
		font-size: 2rem;
		color: #fff;
		margin: 0;
	}
`;

const PassedLine = styled.div`
	content: '';
	position: absolute;
	top: 6px;
	left: 0;
	width: 100%;
	border-bottom: 3px solid green;
`;

const UpcomingLine = styled.div<{
	isLastItem: boolean;
}>`
	${(props) =>
		!props.isLastItem &&
		css`
			content: '';
			position: absolute;
			top: 6px;
			left: 0;
			width: 100%;
			border-bottom: 3px solid #fff;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				right: 100%;
				width: 50px;
				border-bottom: 3px solid #fff;
			}
		`}
`;

export const NextStops: FC<PopupProps> = ({ vehicle }: PopupProps) => {
	const renderThumb = ({ style, ...props }: { style: any }) => {
		const thumbStyle = {
			backgroundColor: '#FFF',
			borderRadius: '3px',
			opacity: 0.4,
		};

		return <div style={{ ...style, ...thumbStyle }} {...props} />;
	};

	console.log(vehicle.trip?.stopovers);

	return (
		<Scrollbars style={{ height: '110px' }} renderThumbHorizontal={renderThumb}>
			<Stops>
				{vehicle.trip?.stopovers?.map(
					(stopOver: StopOver & { arrivalPrognosisType?: string; departurePrognosisType?: string }, i) => (
						<Stop
							key={i}
							isPassed={
								stopOver.arrivalPrognosisType === 'REPORTED' ||
								stopOver.departurePrognosisType === 'REPORTED'
							}>
							<p>{stopOver?.stop?.name?.replace(/ ?\[.*?]/gi, '')}</p>
							<h4>{dayjs(stopOver.arrival || stopOver.departure).format('HH:mm')}</h4>
							{stopOver.arrivalPrognosisType === 'REPORTED' ||
							stopOver.departurePrognosisType === 'REPORTED' ? (
								<PassedLine />
							) : (
								<UpcomingLine isLastItem={i === (vehicle.trip?.stopovers?.length || 0) - 1} />
							)}
						</Stop>
					),
				)}
			</Stops>
		</Scrollbars>
	);
};
