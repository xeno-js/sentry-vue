<div align="center">
  <img src="logo/logo.png" alt="Xeno Vue Logo" width="140" />

  <h1>Xeno.Js Sentry/Vue</h1>
  <p><strong>A Typescript application framework architecture for Node.js, designed for lower technical debt, and faster infrastructure migrations.</strong></p>
  <p>Build long-lived applications with explicit dependency injection, DDD, CQRS, and transport-independent business logic.</p>

  <p>
    <a href="https://www.npmjs.com/package/@xeno-js/sentry-vue">
      <img src="https://img.shields.io/npm/v/@xeno-js/sentry-vue?style=flat-square" alt="npm version" />
    </a>
    <a href="https://github.com/xeno-js/sentry-vue">
      <img src="https://img.shields.io/github/stars/xeno-js/xeno-fe?style=flat-square" alt="GitHub stars" />
    </a>
    <a href="https://img.shields.io/npm/l/@xeno-js/sentry-vue?style=flat-square">
      <img src="https://img.shields.io/npm/l/@xeno-js/sentry-vue?style=flat-square" alt="License: MIT" />
    </a>
    <a href="https://buymeacoffee.com/xenojs">
      <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-FFdd00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
    </a>
  </p>
</div>

---

---

`@xeno-js/sentry-vue` provides error tracking and observability integration for Vue.js applications within the Xeno.JS ecosystem. It acts as a logger plugin adapter implementing core logging contracts to capture runtime exceptions, warnings, and performance traces.

## Installation

```bash
npm install @xeno-js/sentry-vue @sentry/vue

```

The package requires `@xeno-js/core` and Vue 3 as peer dependencies.

---

## 1. Plugin Configuration and Vue Bootstrap

**Problem.** Modern frontend Vue applications require centralized error tracking, performance tracing across route changes, and session replays to monitor production stability.

**Principle.** Error monitoring integration must be declared cleanly through application builder plugins and configuration services without tight coupling to vendor SDKs.

**Mechanism.** The `withSentryVueLogger` function exposes a logger plugin that reads options via `SentryLoggerFactory`, initializes the Sentry Vue SDK, and registers a custom logger instance into the framework.

**Implementation:**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { LOG_LEVEL, XenoAppBuilder } from '@xeno-js/core'
import { withSentryVueLogger } from '@xeno-js/sentry-vue'
import { withPiniaContext, ServicesUtils } from '@xeno-js/vue'

import App from './App.vue'
import { router } from './router'

async function bootstrap() {
    try {
        const app = createApp(App)
        app.use(createPinia())

        const builder = new XenoAppBuilder()
            .addContext(withPiniaContext())
            .addLogger([
                withSentryVueLogger((opts, config) => {
                    opts.isEnabled = config.getEnvironment() === 'production'
                    opts.dsn = config.getOrThrow('SENTRY_DSN')
                    opts.environment = config.getEnvironment()
                    opts.app = app
                    opts.router = router
                    opts.tracesSampleRate = 0.2
                    opts.level = LOG_LEVEL.WARN
                })
            ])

        const xenoApp = await builder.build()
        ServicesUtils.provide(app, xenoApp)

        app.use(router)
        app.mount('#app')
    } catch (error) {
        console.error('Error during application startup', { error })
    }
}

await bootstrap()

```

**Behavior:** During bootstrap, `SentryLoggerFactory` initializes Sentry with browser tracing integration (bound to the Vue router if provided), session replay integration, and custom sample rates. If `isEnabled` is set to `false`, the logger registration is skipped.

**Boundary:** This package exclusively manages Sentry SDK initialization, Vue routing observability, and error log formatting, delegating application routing and UI rendering to Vue and core modules.

---

## 2. Error Tracking and Logging (`SentryLogger`)

**Problem.** Frontend logging implementations need a standardized way to forward messages and exceptions to monitoring services while respecting minimum log level thresholds and attaching component context.

**Principle.** Log events meeting or exceeding severity thresholds must be securely forwarded to the tracking provider with associated extra metadata.

**Mechanism:** `SentryLogger` implements the `ILoggerClient` contract, mapping framework log levels (`DEBUG`, `INFO`, `WARN`, `ERROR`) to Sentry severity levels and utilizing Sentry scopes to capture exceptions or warning messages.

**Implementation:**

The logger can be resolved automatically or accessed via framework utilities:

```ts
import { TOKENS, LOG_LEVEL } from '@xeno-js/core'

// Inside a component setup or service
const logger = container.resolve(TOKENS.LOGGER)
logger.track(LOG_LEVEL.ERROR, 'Failed to fetch user profile', { userId: '123' }, error)

```

**Behavior:** When `track` is invoked, `SentryLogger` evaluates the log level against the configured `minLevel`. If eligible, it opens a Sentry scope, sets extra context metadata, and captures either the exception via `captureException` or a message via `captureMessage`.

**Boundary:** `SentryLogger` acts purely as an observability adapter for structured reporting, relying on the Sentry Vue SDK for network transport.

---

## License

Released under the MIT [License](LICENSE).
