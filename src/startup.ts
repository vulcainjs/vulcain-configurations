import { Application, IContainer, System } from "vulcain-corejs";

// The domain is mandatory
const domain = "vulcain";

// Default configurations
let port = 8080;                      // server port
const enableHystrixStream = false;    // enable hystrix monitoring

/**
 * Startup application class
 *
 * @export
 * @class Startup
 * @extends {Application}
 */
export class Startup extends Application {

    constructor() {
        super(domain);
    }

    /**
     * Provide a way to configure http server adapter before it starts
     *
     * @param {any} adapter
     */
    initializeServerAdapter(adapter) {
        // Enable api key authentifcation
        this.enableApiKeyAuthentication(process.env['AUTH_SERVICE'], process.env['AUTH_VERSION'] || '1.0');
    }

    /**
     * Register default services
     */
    initializeDefaultServices(container: IContainer) {
        if (System.isDevelopment) { // Developper desktop
            container.useMemoryProvider("data");
        }
        else {
           // container.useRabbitBusAdapter();
            container.useMongoProvider();
        }
    }

    /**
     * Entry point
     *
     *
     * @memberOf Startup
     */
    async runAsync() {

        this.enableHystrixStream = enableHystrixStream;

        await super.start(port);
    }
}

