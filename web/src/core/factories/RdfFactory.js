import Config from "../../config/config";
import { getTemplateAttributesByType } from "../converters"

class RdfFactory {
    
    static makeResource(subjectOrObject, attributes){
        return {
            id: subjectOrObject.id,
            value: subjectOrObject.value,
            type: subjectOrObject.type,
            templates: [],
            parallel_inbounds:0,
            attributes
        }
    }

    static makeEmptyIndividual(type){
        let data = getTemplateAttributesByType(type);
        data = {
            ...data,
            templates: [data.template]
        }
        delete data.template;
        data.attributes.find(attr => attr.predicate.uri === Config.getTypePredicate()).objects = [{
            type: 'uri',
            value: type
        }];
        return {
            ...data,
            id: Config.genNodeId(),
            type: 'uri',
            value: ''
        }
    }

    static makeDefaultAttribute(predicate, object){
        return {
            type:'uri',
            datatype: {
                prefix: 'xsd', name: 'string', uri: 'http://www.w3.org/2001/XMLSchema#string'
            },
            objects: object ? [object] : [],
            predicate: {
                uri: predicate.value,
                template: {
                    editor: predicate.value === Config.getTypePredicate() ? Config.getTypeAttributeEditor() : Config.getDefaultAttributeEditor()
                }
            },
            templates: []
        }
    }

    

    static makeBnodeAttribute(object, predicate){
        
        return {
            bnode_type: 'bnode-individual',
            label: object,
            predicate: predicate,
            data: {}
        }
    }

    static makeBnodeLink(predicate, object, type, datatype){
        return {
            bnode_type: 'bnode-link',
            type: type,
            object: object,
            predicate: predicate,
            datatype: datatype
        }
    }

    static makeBnodeArray(items){
        return {
            bnode_type: "bnode-array",
            item_template: items[0],
            array: [...items]
        }
    }

    static makeBnodeLiteralLink(predicate, object, datatype){
        this.makeBnodeLink(predicate, object, 'literal', datatype);
    }
    
    static makeBnodeUriLink(predicate, object){
        this.makeBnodeLink(predicate, object, 'uri');
    }


}

export default RdfFactory;