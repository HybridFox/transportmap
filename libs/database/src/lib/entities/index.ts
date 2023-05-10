import { Agency } from './Agency.entity';
import { Calendar } from './Calendar.entity';
import { CalendarDate } from './CalendarDate.entity';
import { Route } from './Route.entity';
import { Stop } from './Stop.entity';
import { Trip } from './Trip.entity';
import { StopTime } from './StopTime.entity';
import { Transfer } from './Transfer.entity';
import { Translation } from './Translation.entity';
import { GTFSStaticStatus } from './GTFSStaticStatus.entity';
import { GTFSRealtimeStatus } from './GTFSRealtimeStatus.entity';
import { CalculatedTrip } from './CalculatedTrip.entity';

export const PostgresEntities = [Agency, Calendar, CalendarDate, Route, Stop, StopTime, Transfer, Translation, Trip, GTFSStaticStatus, GTFSRealtimeStatus];
export const MongoEntities = [CalculatedTrip]

export { Agency } from './Agency.entity';
export { Calendar } from './Calendar.entity';
export { CalendarDate } from './CalendarDate.entity';
export { Route } from './Route.entity';
export { Stop } from './Stop.entity';
export { StopTime } from './StopTime.entity';
export { Transfer } from './Transfer.entity';
export { Translation } from './Translation.entity';
export { Trip } from './Trip.entity';
export { GTFSStaticStatus } from './GTFSStaticStatus.entity';
export { GTFSRealtimeStatus } from './GTFSRealtimeStatus.entity';
export { CalculatedTrip } from './CalculatedTrip.entity';