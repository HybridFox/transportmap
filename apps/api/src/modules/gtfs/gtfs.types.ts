export interface StopTimeUpdate {
	departure?: StopTimeEvent;
	arrival?: StopTimeEvent;
	stopId: string;
}

export interface StopTimeEvent {
	delay: number;
	time: number;
	uncertainty: number;
}
