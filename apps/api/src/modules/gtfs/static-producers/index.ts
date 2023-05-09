import { AgencyStaticProducerService } from './agency.static-producer';
import { CalendarDateStaticProducerService } from './calendar-date.static-producer';
import { CalendarStaticProducerService } from './calendar.static-producer';
import { RouteStaticProducerService } from './route.static-producer';
import { StopTimeStaticProducerService } from './stop-time.static-producer';
import { StopStaticProducerService } from './stop.static-producer';
import { TripStaticProducerService } from './trip.static-producer';
import { TranslationStaticProducerService } from './translation.static-producer';
import { StopTimeOverrideStaticProducerService } from './stop-time-override.static-producer';

export const StaticProducers = [
	AgencyStaticProducerService,
	CalendarDateStaticProducerService,
	CalendarStaticProducerService,
	RouteStaticProducerService,
	StopTimeStaticProducerService,
	StopStaticProducerService,
	TripStaticProducerService,
	TranslationStaticProducerService,
	StopTimeOverrideStaticProducerService,
];

export { AgencyStaticProducerService } from './agency.static-producer';
export { CalendarDateStaticProducerService } from './calendar-date.static-producer';
export { CalendarStaticProducerService } from './calendar.static-producer';
export { RouteStaticProducerService } from './route.static-producer';
export { StopTimeStaticProducerService } from './stop-time.static-producer';
export { StopStaticProducerService } from './stop.static-producer';
export { TripStaticProducerService } from './trip.static-producer';
export { TranslationStaticProducerService } from './translation.static-producer';
export { StopTimeOverrideStaticProducerService } from './stop-time-override.static-producer';
