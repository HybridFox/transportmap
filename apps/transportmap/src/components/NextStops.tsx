/* eslint-disable indent */
import React, { FC, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import Scrollbars from 'react-custom-scrollbars-2';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useTranslation } from 'react-i18next';
import { ICalculatedTrip, ITripSection, SectionType } from '@transportmap/types';

import { getTranslation } from '../helpers/translation.util';
import { getVehicleProgress } from '../helpers/location.utils';

dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.extend(customParseFormat)

interface PopupProps {
	trip: ICalculatedTrip;
	className?: string;
}

const Stops = styled.div`
	display: flex;
	padding: 0.6rem 0;
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
		background-color: ${(props) => (props.isPassed ? props.theme.main.primary : '#FFF')};
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
	top: 5px;
	left: 0;
	width: 100%;
	border-bottom: 5px solid ${(props) => props.theme.main.primary};
`;

const UpcomingLine = styled.div`
	content: '';
	position: absolute;
	top: 5px;
	left: 0;
	width: 100%;
		border-bottom: 5px solid #fff;
`;

const ActiveLine = styled.div<{ vehicleProgress: number }>`
	content: '';
	position: absolute;
	top: 5px;
	left: 0;
	width: 100%;
	border-bottom: 5px solid #fff;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: ${(props) => props.vehicleProgress * 100}%;
		border-bottom: 5px solid ${(props) => props.theme.main.primary};
	}
`;

const ActiveLineIndicator = styled.div<{ vehicleProgress: number }>`
	left: ${(props) => props.vehicleProgress * 100}%;
	position: absolute;
	transform: translate(-50%, -40%);
	background-color: white;
	height: 30px;
	width: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	z-index: 5;

	span {
		color: ${(props) => props.theme.main.primary};
	}
`

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
	opacity: 0.75;
`

const Delay = styled.span`
	color: ${(props) => props.theme.main.secondary};
`

const OnTime = styled.span`
	/* color: ${(props) => props.theme.main.success}; */
`

export const NextStops: FC<PopupProps> = ({ trip }: PopupProps) => {
	const [t, i18n] = useTranslation();
	const activeLineIndicatorRef = useRef<HTMLDivElement | null>(null);
	const scrollRef = useRef<any | null>(null);
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [vehicleProgress, setVehicleProgress] = useState(0);

	useEffect(() => {
		// Focus on current timing
		setVehicleProgress(getVehicleProgress(trip.sections));
		if (activeLineIndicatorRef.current && scrollRef.current && wrapperRef.current) {
			const indicatorAbsoluteLeft = activeLineIndicatorRef.current.getBoundingClientRect().left;
			const wrapperAbsoluteLeft = wrapperRef.current.getBoundingClientRect().left;
			const containerOffset = indicatorAbsoluteLeft - wrapperAbsoluteLeft;
			scrollRef.current.view.scrollLeft = containerOffset - (scrollRef.current.container.getBoundingClientRect().width / 2);
		}

		const interval = setInterval(() => {
			setVehicleProgress(getVehicleProgress(trip.sections));
		}, 1000)

		return () => {
			clearInterval(interval);
		}
	}, [])

	const renderLine = (section: ITripSection, nextSection: ITripSection) => {
		if ((nextSection.realtimeStartTime || nextSection.startTime) < dayjs().tz('Europe/Brussels').format('HH:mm:ss')) {
			return <PassedLine />
		}

		if ((section.realtimeStartTime || section.startTime) >= dayjs().tz('Europe/Brussels').format('HH:mm:ss')) {
			return <UpcomingLine />
		}

		return <ActiveLine vehicleProgress={vehicleProgress}>
			<ActiveLineIndicator ref={activeLineIndicatorRef} vehicleProgress={vehicleProgress}>
				<span className='uil uil-metro'></span>
			</ActiveLineIndicator>
		</ActiveLine>
	}

	const renderThumb = ({ style, ...props }: { style: any }) => {
		const thumbStyle = {
			backgroundColor: '#FFF',
			borderRadius: '3px',
			opacity: 0.4,
		};

		return <div style={{ ...style, ...thumbStyle }} {...props} />;
	};

	return (
		<Scrollbars style={{ height: '110px' }} renderThumbHorizontal={renderThumb} autoHide ref={scrollRef}>
			<Stops ref={wrapperRef}>
				{trip.sections.filter((section) => section.type === SectionType.STOP)?.map(
					(section, i: number) => (
						<Stop
							key={i}
							isPassed={
								(section.realtimeEndTime || section.endTime) < dayjs().format('HH:mm:ss') || (section.realtimeStartTime || section.startTime) < dayjs().format('HH:mm:ss')
							}>
							<StopName>{getTranslation(section?.stop?.translations, i18n.language) || section?.stop?.name}</StopName>
							<StopTimeWrapper>
								<StopTime>
									<StopTimeTitle>{t('GENERAL.ARRIVAL')}</StopTimeTitle>
									{section.realtimeStartTime ? (
										<>
											<OnTime>{dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section.startTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</OnTime>{' '}
											<Delay>+{dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section.realtimeStartTime}`, 'DD/MM/YYYY HH:mm:ss').diff(dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section.startTime}`, 'DD/MM/YYYY HH:mm:ss'), 'minutes')}'</Delay>
										</>
									) : (
										<OnTime>{dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section.startTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</OnTime>
									)}
								</StopTime>
								<StopTimeSeparator>-</StopTimeSeparator>
								<StopTime>
									<StopTimeTitle>{t('GENERAL.DEPARTURE')}</StopTimeTitle>
									{section.realtimeEndTime ? (
										<>
											<OnTime>{dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section.endTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</OnTime>{' '}
											<Delay>+{dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section.realtimeEndTime}`, 'DD/MM/YYYY HH:mm:ss').diff(dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section.endTime}`, 'DD/MM/YYYY HH:mm:ss'), 'minutes')}'</Delay>
										</>
									) : (
										<OnTime>{dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section.endTime}`, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')}</OnTime>
									)}
								</StopTime>
							</StopTimeWrapper>
							{(trip.sections.filter((section) => section.type === SectionType.STOP).length - 1) !== i && renderLine(section, trip.sections.filter((section) => section.type === SectionType.STOP)[i + 1])}
						</Stop>
					),
				)}
			</Stops>
		</Scrollbars>
	);
};
