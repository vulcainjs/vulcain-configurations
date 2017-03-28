import { Model, Property } from 'vulcain-corejs';

@Model()
export class Configuration {
    @Property({type:'string', required: true, isKey: true, unique: true})
    key: string;
    @Property({type:'string', required: true})
    value: any;
    @Property({type:'string'})
    lastUpdate?: string;
    @Property({type:'boolean'})
    encrypted?: boolean;
    @Property({type:'boolean'})
    deleted?: boolean;
    @Property({type:'boolean'})
    global?: boolean;
}