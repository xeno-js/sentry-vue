import type * as Sentry from '@sentry/vue'
import type { SeverityLevel } from '@sentry/vue'
import type { ILoggerClient, LogLevel, Optional } from '@xeno-js/shared'
import { Guards, LOG_LEVEL } from '@xeno-js/shared'

const SENTRY_LEVEL_MAP: Record<LogLevel, SeverityLevel> = Object.freeze({
  [LOG_LEVEL.DEBUG]: 'debug',
  [LOG_LEVEL.INFO]: 'info',
  [LOG_LEVEL.WARN]: 'warning',
  [LOG_LEVEL.ERROR]: 'error',
})

/**
 * @description Concrete implementation of ILoggerClient that uses Sentry as the error tracking provider.
 * This class acts as an adapter between the ILoggerClient interface and the Sentry client instance,
 * delegating message capture and exception tracking without initializing or configuring the SDK directly.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export class SentryLogger implements ILoggerClient {
  /**
   * @description Constructs a new instance of SentryLogger.
   * @param _client The injected Sentry client instance.
   * @param _minLevel The minimum log level threshold. Messages below this level are ignored. Default is LOG_LEVEL.WARN.
   *
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js
   */
  constructor(
    private readonly _client: typeof Sentry,
    private readonly _minLevel: LogLevel = LOG_LEVEL.WARN,
  ) {}

  public track<T>(
    level: LogLevel,
    message: string,
    context: Optional<T> = undefined,
    error: Optional<unknown> = undefined,
  ): void {
    if (level < this._minLevel) return

    const sentryLevel = SENTRY_LEVEL_MAP[level] ?? 'info'

    this._client.withScope((scope) => {
      scope.setLevel(sentryLevel)

      if (Guards.isDefined(context) && Guards.isObject(context))
        scope.setExtras(context as Record<string, unknown>)

      if (Guards.isDefined(error)) {
        scope.setExtra('log_message', message)
        this._client.captureException(error)
      } else this._client.captureMessage(message, sentryLevel)
    })
  }
}
