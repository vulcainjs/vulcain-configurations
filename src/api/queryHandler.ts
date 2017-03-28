import { Configuration } from "./model";
import { QueryHandler, DefaultQueryHandler } from "vulcain-corejs";

// -----------------------------------------------------------
// Defaut query handlers (get/search)
// -----------------------------------------------------------
@QueryHandler({ scope: "?", schema: "Configuration" })
export class ConfigurationQueryHandler extends DefaultQueryHandler<Configuration> {

}

