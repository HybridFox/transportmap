import { ExecutionContext, Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/core';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			tap(null, (exception) => {
				console.log(exception);
				// CAPTURE ERROR IN SENTRY
				Sentry.captureException(exception);
			}),
		);
	}
}
