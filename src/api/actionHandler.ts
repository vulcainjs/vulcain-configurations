import { ActionHandler, Action, DefaultActionHandler, Inject, System } from 'vulcain-corejs';
import { Configuration } from './model';

// -----------------------------------------------------------
// Default crud action handlers
// -----------------------------------------------------------
@ActionHandler({ async: false, scope: "?", schema: "Configuration" })
export class ConfigurationActionHandler extends DefaultActionHandler {
    // Override default actions

    async createAsync(config: Configuration) {
        config.lastUpdate = System.nowAsString();
        if (config.encrypted) {
            config.value = System.encrypt(JSON.stringify(config.value));
        }
        return super.createAsync(config);
    }

    async updateAsync(config: Configuration) {
        config.lastUpdate = System.nowAsString();
        if (config.encrypted) {
            config.value = System.encrypt(JSON.stringify(config.value));
        }
        return super.updateAsync(config);
    }

    deleteAsync(entity: Configuration) {
        entity.deleted = true; // defer deletion
        return super.updateAsync(entity);
    }
}

