import * as Sentry from '@sentry/vue'
import type { IFactory, ILoggerClient, LogLevel, Optional } from '@xeno-js/shared'
import { Guards, LOG_LEVEL } from '@xeno-js/shared'
import type { Router } from 'vue-router'

import { SentryLogger } from '../loggers/sentry.logger'

type Options = Sentry.BrowserOptions & Sentry.VueIntegrationOptions

/**
 * @description Interface for the Sentry options.
 */
export interface SentryOptions extends Partial<Omit<Options, "tracingOptions">> {
  /**
   * @description The Sentry DSN (Data Source Name) for your project.
   */
  level?: Optional<LogLevel>
  /**
   * @description The Router instance for your Vue application.
   */
  router?: Optional<Router>
  /**
   * @description The environment in which your application is running. This is useful for filtering events in Sentry.
   */
  environment?: Optional<string>
}

/**
 * @description Factory responsible for initializing the Sentry Vue SDK and creating an instance of SentryLogger.
 * Implements the agnostic IFactory contract to allow seamless dependency injection and decoupling.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export class SentryLoggerFactory implements IFactory<Optional<SentryOptions>, ILoggerClient> {
  /**
   * @description Initializes the Sentry Vue SDK with the provided options and returns an ILoggerClient.
   * @param config The Sentry configuration settings.
   * @returns An initialized ILoggerClient adapter.
   */
  public create(config?: Optional<SentryOptions>): ILoggerClient {
    const minLevel: LogLevel = config?.level ?? LOG_LEVEL.WARN

    const integrations = [
      Guards.isDefined(config?.router)
        ? Sentry.browserTracingIntegration({ router: config.router })
        : Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ]

    Sentry.init({
      app: config?.app,
      dsn: config?.dsn,
      environment: config?.environment,
      release: config?.release,
      integrations,
      tracesSampleRate: config?.tracesSampleRate ?? 0.2,
      replaysSessionSampleRate: config?.replaysSessionSampleRate ?? 0.1,
      replaysOnErrorSampleRate: config?.replaysOnErrorSampleRate ?? 1.0,
      ...config
    })

    return new SentryLogger(Sentry, minLevel)
  }
}
