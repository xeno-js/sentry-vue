import type {
    IAppBuilder,
    IConfigurationService,
    ILoggerSetup,
    IXenoApplication,
    LoggerPlugin,
    SetupAction,
    XenoRegistry,
} from '@xeno-js/core'
import { definePlugin, Guards } from '@xeno-js/core'

import { SentryLoggerFactory, type SentryOptions } from './factories'

/**
 * @description Plugin for integrating Redis caching into an application. This plugin provides a convenient way to set up Redis caching with the specified configuration options. It leverages the RedisCacheFactory to create instances of RedisCache based on the provided configuration. The plugin also registers the RedisCacheFactory as a service in the application's dependency injection container.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export const withSentryVueLogger = <TRegistry extends XenoRegistry = XenoRegistry>(
    setupAction: SetupAction<SentryOptions & { isEnabled?: boolean }, IConfigurationService>
): LoggerPlugin<TRegistry> => {
    return definePlugin('logger', (_builder: IAppBuilder<TRegistry, IXenoApplication<TRegistry>>, config: IConfigurationService, ctx?: ILoggerSetup<TRegistry>) => {
        if (!Guards.isDefined(ctx))
            throw new Error('LoggerSetup is not defined.')

        const options: SentryOptions & { isEnabled?: boolean } = {}
        setupAction(options, config)

        const isEnabled = options.isEnabled ?? true
        if (!isEnabled)
            return

        ctx.addCustomLogger(() => new SentryLoggerFactory().create(options))
    })
}
