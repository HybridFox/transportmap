import { ExecutionContext, Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// import * as Sentry from '@sentry/core';

@Injectable()
export class OpenTelemetryInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			tap(null, (exception) => {
				console.log('exc', exception);
				// CAPTURE ERROR IN SENTRY
				// Sentry.captureException(exception);
			}),
		);
	}
}
