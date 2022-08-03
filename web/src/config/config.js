import config from './config.json';


function* IdMaker(){
    var index = 0;
    while(true)
        yield `${index++}`;	
}

var genId = IdMaker();

export default class Config {
    
    static genNodeId() {
        return `node_${genId.next().value}`;
    }

    static genEdgeId() {
        return `edge_${genId.next().value}`;
    }

    static getTypePredicate = () => {
        return config.sparql.type;
    }

    static getXSDPrefix = () => {
        return config.sparql.xsd;
    }

    static getQueryEndpoint = () => {
        return config.sparql.api.query;
    }

    static getUpdateEndpoint = () => {
        return config.sparql.api.update;
    }

    static getGraph = () => {
        return config.sparql.graph;
    }

    static getPrefix = (uri) => {
        for(var pref in config.sparql.prefixes){
            if(uri.startsWith(config.sparql.prefixes[pref])){
                return {
                    prefix: pref,
                    rest: uri.replace(config.sparql.prefixes[pref],''),
                    uri:uri,
                    value: uri
                }
            }
        }
        return {
            prefix: undefined,
            rest: undefined,
            uri:uri,
            value: uri
        };
    }

    static getUri = (prefix, name) => {
        if(prefix in config.sparql.prefixes){
            return `${config.sparql.prefixes[prefix]}${name}`;
        }
        return undefined;
    }

    static getTemplateConfig = (class_uri) => {
        for(const tmp of config.template){
            let type = Config.getUri(tmp.prefix, tmp.name);
            if(type === class_uri){
                return tmp;
            }
        }
        return undefined;
    }

    static getTemplateClasses = () => config.template.map(({prefix, name}) => `${config.sparql.prefixes[prefix] + name}`);

    static getPrefixes = () => Object.entries(config.sparql.prefixes);

    static getMainPrefix = () => Config.getPrefixes()[0][0];

    static getDefaultAttributeEditor = () => config.default_attribute_editor;
    static getTypeAttributeEditor = () => config.type_attribute_editor;
    static getDefaultTypeAttribute = () => config.default_type_attribute;

    static getReactFlowRootPosition = () => config.react_flow.positioning.root;
    static getReactFlowHorizontalSpacing = () => config.react_flow.positioning.spacing.horizontal;
    static getReactFlowVerticalSpacing = () => config.react_flow.positioning.spacing.vertical;
    static getReactFlowOffset = () => config.react_flow.positioning.offset;
}

