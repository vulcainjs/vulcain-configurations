import { Application } from "vulcain-corejs";

let app = new Application('Vulcain');
app.container.useMongoProvider();
app.start(8080);
