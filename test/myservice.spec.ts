import { expect } from 'chai';
import { TestContext, DefaultActionHandler, DefaultQueryHandler, QueryHandler, ActionHandler, Model, Property, RequestContext, IContainer } from 'vulcain-corejs';
import { ConfigurationQueryHandler } from '../dist/api/queryHandler';
import { Configuration } from '../dist/api/model';
import { ConfigurationActionHandler } from "../dist/api/actionHandler";

let test = new TestContext(Configuration);

describe("Default action handler", function () {

    it("should create a configuration", async function () {
        const actions = test.createHandler<ConfigurationActionHandler>(ConfigurationActionHandler);
        await actions.createAsync({ key: "cfg1", value: "value" });
        let query = test.createHandler<ConfigurationQueryHandler>(ConfigurationQueryHandler);
        let entity = await query.getAsync("cfg1");
        expect(entity).to.be.not.null;
    });

    it("should read a configuration", async function () {
        let query = test.createHandler<ConfigurationQueryHandler>(ConfigurationQueryHandler);
        let entity = await query.getAllAsync();
        expect(entity).to.be.not.null;
    });
});



