import { IScopedComponent, Query, RequestContext, Property, Model, IContainer, Inject, DefaultServiceNames, ApplicationRequestError, System, QueryHandler } from 'vulcain-corejs';
import { Configuration } from './model';
import { ConfigurationQueryHandler } from "./queryHandler";

@Model()
export class ForServiceArguments {
    @Property({ type: "string", required: false })
    environment: string;
    @Property({ type: "string", required: true })
    service: string;
    @Property({ type: "string", required: true })
    version: string;
    @Property({ type: "string", required: true })
    domain: string;
    @Property({ type: "string", required: false })
    lastUpdate: string;
}

/**
 * Handler used by vulcainConfigurationSource
 */
@QueryHandler({ scope: "?"})
export class ConfigForServiceHandler implements IScopedComponent {
    @Inject(DefaultServiceNames.Container)
    container: IContainer;

    @Inject()
    configurations: ConfigurationQueryHandler;

    requestContext: RequestContext;

    @Query({ description: "Get all configs for one service", action: "forService" })
    async getConfigForServiceAsync(p: ForServiceArguments): Promise<Array<Configuration>> {

        if (!System.isTestEnvironnment && !this.requestContext.userHasScope("configurations:read")) {
            throw new ApplicationRequestError("Not authorized", null, 403);
        }
        const serviceFullName = [p.domain, p.service, p.version].join('.');

        let list = await this.configurations.getAllAsync({
            $or: [
                { global: true },
                { key: { $regex: '^' + serviceFullName } }
            ]
        });

        let result = [];
        let toBeDeleted = [];

        for (let cfg of list) {
            // Delete config older than one day
            if (cfg.deleted && System.diffFromNow(cfg.lastUpdate) > 24 * 60 * 60) {
                toBeDeleted.push(cfg);
                continue;
            }

            if (p.lastUpdate && cfg.lastUpdate < p.lastUpdate) {
                continue;
            }

            result.push({
                key: cfg.key.substr("shared.".length),
                deleted: cfg.deleted,
                encrypted: cfg.encrypted,
                value: cfg.value
            });
        }

        // We make use of this periodic request to remove configuration physically
        // after a period of 24H.
        if (toBeDeleted.length > 0) {
            for (let cfg of toBeDeleted) {
                const command = await this.requestContext.getCommandAsync("DefaultRepositoryCommand", "Configuration");
                await command.runAsync<Array<Configuration>>("delete", cfg);
            }
        }

        return result;
    }
}