import { propOr } from 'ramda';
import React, { FC } from 'react';

interface MapMarkerProps {
	vehicle: any;
	isSelected?: boolean;
}

const productIconMap = {
	bus: 'bus',
	'local-train': 'train',
	'intercity-p': 'train',
	's-train': 'train',
	metro: 'metro',
	tram: 'metro',
};

export const MapMarker: FC<MapMarkerProps> = ({ vehicle, isSelected }: MapMarkerProps) => {
	if (isSelected) {
		return (
			<svg viewBox="0 0 125 50">
				<rect fill="#212121" width="125" height="46.21" rx="21.72" />
				<polygon
					fill="#212121"
					points="62.5 44.46 68.88 44.46 65.69 47.23 62.5 50 59.31 47.23 56.12 44.46 62.5 44.46"
				/>
				<use
					x="9"
					y="8"
					xlinkHref={`/assets/img/icons/${propOr(
						'unknown',
						vehicle?.line?.product || '',
					)(productIconMap)}.svg#icon`}
					height="30"
					width="30"></use>
				<rect
					x="53"
					y="10"
					width="60"
					height="26"
					rx="11"
					strokeWidth="2"
					fill={vehicle?.extraData?.backgroundColor || '#000'}
					stroke={vehicle?.extraData?.backgroundBorderColor || '#FFF'}
				/>
				<text
					x="83"
					y="25"
					fontSize="18"
					fill={vehicle?.extraData?.foregroundColor || '#FFF'}
					textAnchor="middle"
					fontFamily="Prompt"
					fontWeight="bold"
					dominantBaseline="middle">
					{vehicle?.line?.id?.split('-')[1]}
				</text>
			</svg>
		);
	}

	return (
		<svg viewBox="0 0 50 50">
			<rect fill="#212121" x="1.9" width="46.21" height="46.21" rx="21.72" />
			<polygon fill="#212121" points="25 44.46 31.38 44.46 28.19 47.23 25 50 21.81 47.23 18.62 44.46 25 44.46" />
			<use
				x="9"
				y="8"
				xlinkHref={`/assets/img/icons/${propOr(
					'unknown',
					vehicle?.line?.product || '',
				)(productIconMap)}.svg#icon`}
				height="30"
				width="30"></use>
		</svg>
	);
};
