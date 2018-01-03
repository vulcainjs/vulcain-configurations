import { ActionHandler, Action, DefaultActionHandler, Inject, Service } from 'vulcain-corejs';
import { Configuration } from './model';

// -----------------------------------------------------------
// Default crud action handlers
// -----------------------------------------------------------
@ActionHandler({ async: false, scope: "?", schema: "Configuration" })
export class ConfigurationActionHandler extends DefaultActionHandler {
    // Override default actions

    async create(config: Configuration) {
        config.lastUpdate = Service.nowAsString();
        if (config.encrypted) {
            config.value = Service.encrypt(JSON.stringify(config.value));
        }
        return super.create(config);
    }

    async update(config: Configuration) {
        config.lastUpdate = Service.nowAsString();
        if (config.encrypted) {
            config.value = Service.encrypt(JSON.stringify(config.value));
        }
        return super.update(config);
    }

    delete(entity: Configuration) {
        entity.deleted = true; // defer deletion
        return super.update(entity);
    }
}

