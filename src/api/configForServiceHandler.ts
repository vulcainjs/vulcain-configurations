import {
    IScopedComponent, Query, Property, Model, IContainer, Inject, DefaultServiceNames, Service,
    QueryHandler, IRequestContext, ApplicationError
} from 'vulcain-corejs';
import { Configuration } from './model';
import { ConfigurationQueryHandler } from "./queryHandler";
import { CommandFactory } from 'vulcain-corejs/dist/commands/commandFactory';
import { DefaultCRUDCommand } from 'vulcain-corejs/dist/defaults/crudHandlers';
const moment = require('moment');

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

    context: IRequestContext;

    protected createDefaultCommand() {
        return CommandFactory.createCommand<DefaultCRUDCommand>(this.context, "ConfigurationCommand", "Configuration");
    }

    private diffFromNow(date: string) {
        return moment.utc().diff(moment(date), "second");
    }

    @Query({ description: "Get all configs for one service", action: "configforService" })
    async getConfigForService(p: ForServiceArguments): Promise<Array<Configuration>> {

        if (!Service.isTestEnvironment && !this.context.user.hasScope("configurations:read")) {
            throw new ApplicationError("Not authorized", 403);
        }
        const serviceFullName = [p.domain, p.service, p.version].join('.');

        let queryResult = await this.configurations.getAll({
            $or: [
                { global: true },
                { key: { $regex: '^' + serviceFullName } }
            ]
        });

        let result = [];
        let toBeDeleted = [];

        for (let cfg of queryResult.values) {
            // Delete config older than one day
            if (cfg.deleted && this.diffFromNow(cfg.lastUpdate) > 24 * 60 * 60) {
                toBeDeleted.push(cfg);
                continue;
            }

            if (p.lastUpdate && cfg.lastUpdate < p.lastUpdate) {
                continue;
            }

            result.push({
                key: cfg.key,
                deleted: cfg.deleted,
                encrypted: cfg.encrypted,
                value: cfg.value
            });
        }

        // We make use of this periodic request to remove configuration physically
        // after a period of 24H.
        if (toBeDeleted.length > 0) {
            for (let cfg of toBeDeleted) {
                const command = this.createDefaultCommand();
                await command.delete(cfg);
            }
        }

        return result;
    }
}