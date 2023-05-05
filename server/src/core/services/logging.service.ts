import { Injectable } from '@nestjs/common';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Exception } from '@sentry/node';

import { SentryMessage, SentrySeverity } from '../enum/sentry.enum';

@Injectable()
export class LoggingService {
	constructor(@InjectSentry() private readonly sentryService: SentryService) {}

	public captureMessage(message: SentryMessage, severity: SentrySeverity, debugInfo: any): void {
		this.sentryService.instance().captureMessage(message, {
			level: severity,
			contexts: debugInfo,
			tags: {
				message,
			},
		});
	}

	public captureException(exception: Exception, message: SentryMessage, severity: SentrySeverity, debugInfo: any): void {
		this.sentryService.instance().captureException(exception, {
			level: severity,
			contexts: debugInfo,
			tags: {
				message,
			},
		});
	}
}
