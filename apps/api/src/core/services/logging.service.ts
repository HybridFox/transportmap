import { Injectable } from '@nestjs/common';
// import * as OpenTelemetry from '@sentry/node';
import { Exception } from '@sentry/node';

import { OpenTelemetryMessage, OpenTelemetrySeverity } from '../enum/open-telemetry.enum';

@Injectable()
export class LoggingService {
	public captureMessage(message: OpenTelemetryMessage, severity: OpenTelemetrySeverity, debugInfo: any): void {
		console.log('event!!!');
		try {
			// const eventId = OpenTelemetry.captureMessage(message, {
			// 	level: severity,
			// 	extra: debugInfo,
			// 	tags: {
			// 		message,
			// 	},
			// });
			// console.log('eventId', eventId);
		} catch (e) {
			console.error(e);
		}
	}

	public captureException(exception: Exception, message: OpenTelemetryMessage, severity: OpenTelemetrySeverity, debugInfo: any): void {
		// OpenTelemetry.captureException(exception, {
		// 	level: severity,
		// 	extra: debugInfo,
		// 	tags: {
		// 		message,
		// 	},
		// });
	}
}
