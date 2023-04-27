/* eslint-disable indent */
import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import Scrollbars from 'react-custom-scrollbars-2';

dayjs.extend(customParseFormat)

import { StopTime, Trip } from '../store/vehicles/trips.types';

interface PopupProps {
	trip: Trip;
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

const StopName = styled.div`
	white-space: nowrap;
	color: #FFF;
`

const StopTimeWrapper = styled.div`
	display: flex;
	align-items: flex-end;
`

const StopTimeSeparator = styled.p`
	margin: 0 0.5rem;
	align-self: flex-end;
	line-height: 1;
`

const StopTime = styled.div`
	line-height: 1;
	margin: 0;
	font-size: 1rem;
	white-space: nowrap;
`;

const StopTimeTitle = styled.p`
	margin: 0;
	font-size: 0.8rem;
	color: #989898;
`;

const Strikethrough = styled.span`
	text-decoration: line-through;
`

// TODO: colors
const Delay = styled.span`
	color: red;
`

const OnTime = styled.span`
	color: green;
`

export const NextStops: FC<PopupProps> = ({ trip }: PopupProps) => {
	const renderThumb = ({ style, ...props }: { style: any }) => {
		const thumbStyle = {
			backgroundColor: '#FFF',
			borderRadius: '3px',
			opacity: 0.4,
		};

		return <div style={{ ...style, ...thumbStyle }} {...props} />;
	};

	return (
		<Scrollbars style={{ height: '110px' }} renderThumbHorizontal={renderThumb}>
			<Stops>
				{trip.stopTimes?.map(
					(stopTime: StopTime, i) => console.log(stopTime) as any || (
						<Stop
							key={i}
							isPassed={
								stopTime.departureTime < dayjs().format('HH:mm:ss')
							}>
							<StopName>{stopTime?.stop?.name?.replace(/ ?\[.*?]/gi, '')}</StopName>
							<StopTimeWrapper>
								<StopTime>
									<StopTimeTitle>Arrival</StopTimeTitle>
									{stopTime.realtimeArrivalTime ? (
										<>
											<Strikethrough>{dayjs(`${dayjs().format('DD/MM/YYYY')} ${stopTime.arrivalTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</Strikethrough>{' '}
											<Delay>{dayjs(`${dayjs().format('DD/MM/YYYY')} ${stopTime.realtimeArrivalTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</Delay>
										</>
									) : (
										<OnTime>{dayjs(`${dayjs().format('DD/MM/YYYY')} ${stopTime.arrivalTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</OnTime>
									)}
								</StopTime>
								<StopTimeSeparator>-</StopTimeSeparator>
								<StopTime>
									<StopTimeTitle>Departure</StopTimeTitle>
									{stopTime.realtimeDepartureTime ? (
										<>
											<Strikethrough>{dayjs(`${dayjs().format('DD/MM/YYYY')} ${stopTime.departureTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</Strikethrough>{' '}
											<Delay>{dayjs(`${dayjs().format('DD/MM/YYYY')} ${stopTime.realtimeDepartureTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</Delay>
										</>
									) : (
										<OnTime>{dayjs(`${dayjs().format('DD/MM/YYYY')} ${stopTime.departureTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</OnTime>
									)}
								</StopTime>
							</StopTimeWrapper>
							{stopTime.departureTime < dayjs().format('HH:mm:ss') ? (
								<PassedLine />
							) : (
								<UpcomingLine isLastItem={i === (trip.stopTimes?.length || 0) - 1} />
							)}
						</Stop>
					),
				)}
			</Stops>
		</Scrollbars>
	);
};
