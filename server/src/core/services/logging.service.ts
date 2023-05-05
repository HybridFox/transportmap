import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Exception } from '@sentry/node';

import { SentryMessage, SentrySeverity } from '../enum/sentry.enum';

@Injectable()
export class LoggingService {
	public captureMessage(message: SentryMessage, severity: SentrySeverity, debugInfo: any): void {
		console.log('event!!!');
		try {
			const eventId = Sentry.captureMessage(message, {
				level: severity,
				contexts: debugInfo,
				tags: {
					message,
				},
			});
			console.log('eventId', eventId);
		} catch (e) {
			console.error(e);
		}
	}

	public captureException(exception: Exception, message: SentryMessage, severity: SentrySeverity, debugInfo: any): void {
		Sentry.captureException(exception, {
			level: severity,
			contexts: debugInfo,
			tags: {
				message,
			},
		});
	}
}
