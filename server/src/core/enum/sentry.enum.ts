export enum SentryMessage {
	REALTIME_GTFS_FEED_EMPTY = 'REALTIME_GTFS_FEED_EMPTY',
	REALTIME_GTFS_INACCESSIBLE = 'REALTIME_GTFS_INACCESSIBLE',
	REALTIME_GTFS_GENERIC_FAIL = 'REALTIME_GTFS_GENERIC_FAIL',
}

export enum SentrySeverity {
	FATAL = 'fatal',
	ERROR = 'error',
	WARNING = 'warning',
	LOG = 'log',
	INFO = 'info',
	DEBUG = 'debug',
}