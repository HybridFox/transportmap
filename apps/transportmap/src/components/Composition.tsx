import React, { FC } from 'react';
import styled from 'styled-components';
import { Scrollbars } from 'react-custom-scrollbars-2';

import { Trip } from '../store/trips/trips.types';

export interface Composition {
	hasReadingLights: boolean;
	hasFoldingSeats: boolean;
	hasAssistanceButtons: boolean;
	hasToilets: boolean;
	hasTables: boolean;
	hasSecondClassOutlets: boolean;
	hasFirstClassOutlets: boolean;
	hasHeating: boolean;
	hasAirco: boolean;
	typeDescriptionNl: string;
	tractionType: string;
	pullPushType: string;
	diagramServiceNumber: number;
	materialNumber: number;
	materialDiagram: string;
	parentUicCode: string;
	uicCode: string;
	isLocoInUse: boolean;
	inDirection: boolean;
	tractionPosition: number;
	positionInComposition: number;
	materialSubTypeName: string;
	typeDescriptionFr: string;
	parentMaterialSubTypeName: string;
	hasPriorityPlaces: boolean;
	brutoWeight: number;
	lengthInMeter: number;
	hasPrmSection: boolean;
	standingPlacesSecondClass: number;
	standingPlacesFirstClass: number;
	seatsCoupeSecondClass: number;
	seatsCoupeFirstClass: number;
	seatsSecondClass: number;
	seatsFirstClass: number;
	isDrivingCabinetAvailable: boolean;
	hasServiceSection: boolean;
	withTowBar: boolean;
	withTractionCoupling: boolean;
	hasBikeSection: boolean;
	isEquipedForMux: boolean;
	isSecondClass: boolean;
	isFirstClass: boolean;
	materialSubTypeSuffix: string;
	withAutomaticCoupling: boolean;
	subTypeDescriptionFr: string;
	subTypeDescriptionNl: string;
	canPassToNextUnit: boolean;
	hasCameras: boolean;
	hasRealTimeInformationScreens: boolean;
	hasWasteBins: boolean;
	hasSemiAutomaticInteriorDoors: boolean;
	hasLuggageSection: boolean;
}

interface CompositionProps {
	trip: Trip;
	className?: string;
}

const Vehicles = styled.div`
	display: flex;
	align-items: flex-end;
	height: 100px;

	img.u-flipped {
		transform: rotateY(180deg);
	}
`;

const Vehicle = styled.div`
	position: relative;
	padding-top: 1rem;
	text-align: center;
	
	img {
		display: block;
	}
`;

const VehicleInfo = styled.div`
	position: relative;
	margin: 1rem 0;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 5px;
	padding: .25rem 1rem;
	min-height: 29px;

	span {
		line-height: 10px;
		margin: 0 .25rem;
		color: #e0e0e0;
	}
`;

const Class = styled.span`
	font-weight: bold;
	border: 2px solid #e0e0e0;
	border-radius: 5px;
	font-size: .8rem;
	padding: .2rem .4rem;
	display: inline-block;
`

export const Composition: FC<CompositionProps> = ({ trip }: CompositionProps) => {
	const renderThumb = ({ style, ...props }: { style: any }) => {
		const thumbStyle = {
			backgroundColor: '#FFF',
			borderRadius: '3px',
			opacity: 0.4,
		};

		return <div style={{ ...style, ...thumbStyle }} {...props} />
	}
	
	return (
		<Scrollbars style={{ height: "110px" }} renderThumbHorizontal={renderThumb}>
			<Vehicles>
				{(trip?.composition?.[0]?.materialUnits || []).filter((x: Composition) => x.materialSubTypeName).map((composition: Composition, i: number) => (
					<Vehicle key={i}>
						<img
							src={`/assets/img/vehicles/${composition.materialSubTypeName}${composition.isFirstClass ? '_p' : ''}.gif`}
							alt=""
							className={composition.inDirection ? '' : 'u-flipped'}
						/>
						<VehicleInfo>
							{composition.isFirstClass && <Class>1</Class>}
							{composition.isSecondClass && <Class>2</Class>}
							{composition.hasAirco && <span className="uil uil-snowflake"></span>}
							{composition.hasToilets && <span className="uil uil-toilet-paper"></span>}
							{composition.hasBikeSection && <span className="uil uil-luggage-cart"></span>}
						</VehicleInfo>
					</Vehicle>
				))}
			</Vehicles>
		</Scrollbars>
	);
};
