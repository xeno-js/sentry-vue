// infrastructure/loggers/__tests__/sentry-logger.factory.test.ts
import * as Sentry from '@sentry/vue'
import { LOG_LEVEL, type Optional } from '@xeno-js/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import type { Router } from 'vue-router'

import { SentryLoggerFactory, type SentryOptions } from '../../factories/sentry-logger.factory'
import { SentryLogger } from '../sentry.logger'

vi.mock('@sentry/vue', () => ({
    init: vi.fn(),
    browserTracingIntegration: vi.fn((opts?: unknown) => ({ name: 'BrowserTracing', opts })),
    replayIntegration: vi.fn(() => ({ name: 'Replay' })),
    withScope: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
}))

describe('SentryLoggerFactory', () => {
    let factory: SentryLoggerFactory

    beforeEach(() => {
        factory = new SentryLoggerFactory()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('initializes Sentry SDK with provided config and default options', () => {
        const config: SentryOptions = {
            dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
            environment: 'production',
        }

        const client = factory.create(config)

        expect(client).toBeInstanceOf(SentryLogger)
        expect(Sentry.init).toHaveBeenCalledOnce()
        expect(Sentry.init).toHaveBeenCalledWith(
            expect.objectContaining({
                dsn: config.dsn,
                environment: 'production',
                tracesSampleRate: 0.2,
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1.0,
            }),
        )
        expect(Sentry.browserTracingIntegration).toHaveBeenCalledWith()
        expect(Sentry.replayIntegration).toHaveBeenCalledOnce()
    })

    it('configures browserTracingIntegration with router when router is provided', () => {
        const mockRouter = { currentRoute: { value: { path: '/' } } }
        const config: SentryOptions = {
            dsn: 'https://key@sentry.io/1',
            environment: 'staging',
            router: mockRouter as Router,
            level: LOG_LEVEL.ERROR,
            tracesSampleRate: 0.5,
        }

        const client = factory.create(config)

        expect(client).toBeInstanceOf(SentryLogger)
        expect(Sentry.browserTracingIntegration).toHaveBeenCalledWith({ router: mockRouter })
        expect(Sentry.init).toHaveBeenCalledWith(
            expect.objectContaining({
                tracesSampleRate: 0.5,
            }),
        )
    })

    it('passes custom app and release to Sentry.init', () => {
        const mockApp = { use: vi.fn() }
        const config: SentryOptions = {
            dsn: 'https://key@sentry.io/1',
            environment: 'production',
            app: mockApp as unknown as Optional<App| App[]>,
            release: 'v1.0.0',
        }

        factory.create(config)

        expect(Sentry.init).toHaveBeenCalledWith(
            expect.objectContaining({
                app: mockApp,
                release: 'v1.0.0',
            }),
        )
    })
})