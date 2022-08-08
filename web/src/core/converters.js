import Config from '../config/config';
import FlowFactory from './factories/FlowFactory';
import RdfFactory from './factories/RdfFactory';

// Exported Functions

/*
    Converts RDF triples to react flow graph data. 
    Transforms edges into node attributes and groups attributes 
    based on template configurations.
    Sets the node positioning.
    {
        nodes: [],
        edges: [],
    }
*/

export const reactFlowGraphDataConverter = (triples, individual) => {
    return nodePositioning(
        transformRelationsIntoAttributs(
            transformTriplesToGraphElements(triples)
        ),
        individual
    );
};

/*
 Converts RDF triples to force graph graph data.
 {
     nodes: [],
     links: []
 }
*/
export const rawGraphDataConverter = (triples) => {
    const nodes = [];
    var links = []; 
    let graphdata = { 
        nodes: [],
        links: []
    };

    triples.forEach((res) => {
        let subject = nodes.find(n => n.val === res.s.value);
        
        if(!subject){
            subject = {
                id: Config.genNodeId(),
                val: res.s.value,
            };
            nodes.push(subject);
        }
        
        let object;
        if(res.o.type === 'literal'){
            let prefixedDatatype = res.o.datatype ? Config.getPrefix(res.o.datatype) : {
                prefix: 'xsd',
                rest: 'string'
            };
            object = {
                id: Config.genNodeId(),
                val: res.o.value + '^^' + prefixedDatatype.prefix + ':' + prefixedDatatype.rest,
            };
            nodes.push(object);
        }else{
            object = nodes.find(n => n.val === res.o.value);
            if(!object){
                object = {
                    id: Config.genNodeId(),
                    val: res.o.value,
                };
                nodes.push(object);
            }
        }
       
        links.push({
            source: subject.id,
            target: object.id,
            predicate: res.p.value 
        });
    });
        
    graphdata.nodes = nodes;

    links = links.filter((d) => {
        return d.source !== d.target;
    });
    
    graphdata.links = links;
    return graphdata;
}


export const getTemplateAttributesByType = (type) => {
    let template = Config.getTemplateConfig(type);

    if(template){
        if(!findPredicate(Config.getTypePredicate(), template.predicates)){
            // mandatory type attribute
            template.predicates.unshift(Config.getDefaultTypeAttribute());
        };
    
        return {
            template: template,
            attributes: template.predicates
                .filter((s) => s.grouping === 'attribute')
                .map((s) => ({
                    field: s.editor.field,
                    datatype: s.datatype ? { // add uri to datatype
                                            ...s.datatype, 
                                            uri: Config.getUri(s.datatype.prefix, s.datatype.name)
                                        } : { // xsd:string when missing datatype, with uri
                                            prefix: 'xsd',
                                            name: 'string',
                                            uri: Config.getUri('xsd', 'string')                                        },
                    templates: [template.name],
                    predicate: {
                        uri: Config.getUri(s.prefix, s.name),
                        template: s
                    },
                    objects: []
            }))
        };
    }
    return{
        template: undefined,
        attributes: []
    }
}

// Private Functions

const positionSiblings = (current, siblings, allNodes, allEdges) => {
    let currentPosition = current.position;
    let y = 0;
    let offset = 0;
    for(const sibling of siblings){
      if(sibling.position) {
          continue;
      }
      sibling.position = {
        x: currentPosition.x + Config.getReactFlowHorizontalSpacing() + offset,
        y: currentPosition.y + y,
      };
      offset += Config.getReactFlowOffset();
      y += Config.getReactFlowVerticalSpacing();

      let siblingEdges = allEdges.filter(edge => edge.source === sibling.id);
      let siblingNodes = allNodes.filter(node => siblingEdges.find(edge => edge.target === node.id));
      if(siblingNodes){
        positionSiblings(sibling, siblingNodes, allNodes, allEdges);
      }
    }
    return allNodes;
  }

export const nodePositioning = ({nodes, edges}, individual, initialPosition = Config.getReactFlowRootPosition()) => {
    let rootNode;
    if(individual === 'bnode-focus'){
        rootNode = nodes[0];
    }else{
        rootNode = nodes.find(node => node.data.value === individual);
    }
    
    if(rootNode){
        rootNode.position = initialPosition;
        let siblingEdges = edges.filter(edge => edge.source === rootNode.id);
        let siblingNodes = nodes.filter(node => siblingEdges.find(edge => edge.target === node.id));
        nodes = positionSiblings(rootNode, siblingNodes, nodes, edges);
    }
    
    return {
      nodes: nodes.filter(node => node.position),
      edges
    }
}

const initNodeByType = (node) => { 
    switch(node.type){
        case 'uri':
        case 'literal':
            return FlowFactory.makeNodeUpdate(node);
        case 'bnode':
            return FlowFactory.makeNodeBlank(node);
        default:
            return FlowFactory.makeNodeUpdate(node);
    }
}

const handleResource = (ressource, nodes, resources) => {
    /*
        Create a node for each subject or object not already existing
        Include subject or object as individual when their type is uri or bnode
    */
    let node;
    let existingNode = nodes.find(n => n.data.type === ressource.type && n.data.value === ressource.value);
    if(!existingNode){
        node = ressource;
        nodes.push(initNodeByType(ressource));
        if((node.type === 'uri' || node.type === 'bnode') ){
            // subject is an uri or bnode, add it to the resources
            resources.push(RdfFactory.makeResource(node, []));
        } 
    }else{
        node = existingNode.data;
    }
    return{
        newNode: node,
        nodes,
        resources,
    }
}

const transformTriplesToGraphElements = (triples) => {
    
    let resources = [];
    let nodes = [];
    let edges = [];

    // Initializing nodes and edges
    for(const {s,p,o} of triples){
        /* 
            Create a new node for every RDF resource if it doesn't exist yet.
            Assign a unique id to each node -> to be used by react flow
        */
        
        let { newNode: subjectNode, nodes: newNodesSubject, resources: newResourcesSubject } = handleResource(s, nodes, resources);
        nodes = newNodesSubject;
        resources = newResourcesSubject;

        // explicitly declare the string datatype when missing
        if(o.type === 'literal' && !o.datatype){
            o.datatype = 'http://www.w3.org/2001/XMLSchema#string';
        }
        
        let { newNode: objectNode, nodes: newNodesObject, resources: newResourcesObject } = handleResource(o, nodes, resources);
        nodes = newNodesObject;
        resources = newResourcesObject;

        /*
            Create a new edge between subject and object nodes.
            Assign a unique id to each edge containing the subject and object ids -> to be used by react flow.
        */
        edges.push(FlowFactory.makeEdgeUpdate(subjectNode, p, objectNode));

        /* 
            When an RDF resource has a type, it becomes an individual. Search for the template for the corresponding individual.
            Multiple tamplates might be assigned to a single individual.
            Necessary for attribute grouping.
        */
        if(p.value === Config.getTypePredicate()){
            let individual = resources.find(ind => ind.value === subjectNode.value);
            let {attributes, template} = getTemplateAttributesByType(objectNode.value);

            if(template){
                individual.templates.push(template);
                // merge attributes of multiple templates into individual.attributes
                for(const attribute of attributes){
                    let existingAttribute = individual.attributes.find(attr => attr.predicate.uri === attribute.predicate.uri);
                    if(!existingAttribute){
                        individual.attributes.push(attribute);
                    }
                }
            }
        }
    }
   
    return {
        nodes,
        edges,
        resources
    }
}

const transformRelationsIntoAttributs = ({ nodes, edges, resources }) => {
    let groupedEdges = [];
    /* Group attributes based on template configurations or default grouping. */
    for(const ressource of resources){
        let index = nodes.findIndex(node => node.data.type === ressource.type && node.data.value === ressource.value);
        if(index === -1) continue;
        nodes[index].data = ressource;
        const indId = nodes[index].id;

        // a resource having indentified templates must have type property, it is an individual with known template
        let isTemplateIndividual = ressource.templates.length > 0;
        if(!isTemplateIndividual && ressource.type !== 'bnode' && ressource.attributes.length === 0){
            // it could be an RDF resouce (without rdf:type) or an individual with an unknown template
            // mandatory type attribute for any type of resource other than a bnode
            ressource.attributes.push(RdfFactory.makeDefaultAttribute({
                type: 'uri',
                value: Config.getTypePredicate()
            }));
        }
        // loop adjacent edges to find the ones that corresponds to the template
        for(const edge of edges.filter(e => e.source === indId)){

            if(isTemplateIndividual){
                // individual might have multiple templates classes
                for(const { name, predicates } of ressource.templates){
                    let predicate = findPredicate(edge.data.predicate.value, predicates);
                    if(predicate && predicate.grouping === 'attribute'){
                        let existing = ressource.attributes.find(attr => {
                            return attr.predicate.template.name === predicate.name;
                        });
                        
                        if(existing){
                            // Add template name into attribute to trace back the template configuration
                            if(!existing.templates.includes(name)){
                                existing.templates.push(name);
                            }
                            // When the object type is URI, single attribute might cary several objects.
                            if(!existing.objects.find(obj => {
                                return obj.value === edge.data.object.value && obj.datatype === edge.data.object.datatype;
                            })){
                                                    
                                let object = edge.data.object;
                                if(object.type === 'bnode'){
                                    // deep include the complete blank node tree when object is a blank node
                                    let { bnode, groupedEdges: groupedBnodeEdges } = getDeepBnodeAttribute(edge, edges);
                                    existing.objects.push(bnode);
                                    groupedEdges = [...groupedEdges, ...groupedBnodeEdges];
                                    
                                }else{
                                    existing.objects.push(edge.data.object);
                                }
                            }
                        }
                        groupedEdges.push(edge);
                    }
                }
            } else {
               
                let {predicate, object} = edge.data;
                let typeOrLiteral = predicate.value === Config.getTypePredicate() || object.type === 'literal';

                // default grouping : literals and types as attributes, uri and bnodes as relations
                if(typeOrLiteral){
                    let attribute = ressource.attributes.find(attr => attr.predicate.uri === predicate.value);
                    if(!attribute){
                        ressource.attributes.push(RdfFactory.makeDefaultAttribute(predicate, object));
                    }else {                 
                        if(!attribute.objects.find(obj => obj.value === object.value && obj.datatype === object.datatype)){
                            attribute.objects.push(object);
                        }
                    }
                    groupedEdges.push(edge);
                }
            }
        }
    }

    // remove grouped edges and nodes
    edges = edges.filter(edge => !groupedEdges.some(groupedEdge => groupedEdge === edge));
    nodes = nodes.filter(node => !groupedEdges.some(groupedEdge => {
        return groupedEdge.data.object.value === node.data.value;
    }));   

    // take care of parallel edges
    let parallelEdges = edges.filter(edge => edges.some(otherEdge => edge.id !== otherEdge.id && edge.source === otherEdge.source && edge.target === otherEdge.target));

    for(let i = 0; i < parallelEdges.length; ++i){
        let edge = parallelEdges[i];
        edge.data.siblings = i;
    }
    
    return {
        nodes: nodes.filter(n => n.data.templates),
        edges
    }
}

const getDeepBnodeAttribute = (edge, edges) => {
    // recursively group bnode objects into bnode attribute
    // bnode attribute is represented as a dictionary with predicates as keys and objects as value - O(1) lookup
    // the associated viewer and editor must know how to interpret its structure 
    let bnode = RdfFactory.makeBnodeAttribute(edge.data.object.value, edge.data.predicate.value);
    let groupedEdges = [];
    let bnodeEdges = edges.filter(e => e.source === edge.data.object.id);
    groupedEdges = [...groupedEdges, ...bnodeEdges];
    for(const bnodeEdge of bnodeEdges){
        if(bnodeEdge.data.object.type === 'bnode'){
            // recursive call
            let { bnode: innerBnode, groupedEdges: innerGroupedEdges } = getDeepBnodeAttribute(bnodeEdge, edges);
            let predicate = Config.getPrefix(innerBnode.predicate);
            bnode.data[predicate.rest] = {
                prefix: predicate.prefix,
                ...innerBnode
            };
            groupedEdges = [...groupedEdges, ...innerGroupedEdges];
        }else{
            let predicate = Config.getPrefix(bnodeEdge.data.predicate.value);
            let existingData = bnode.data[predicate.rest];
            let newData = RdfFactory.makeBnodeLink(bnodeEdge.data.predicate.value, bnodeEdge.data.object.value, bnodeEdge.data.object.type, bnodeEdge.data.object.datatype);
            if(existingData){
                // multiple objects for the same predicate, store as array
                if(Array.isArray(bnode.data[predicate.rest].object)){
                    bnode.data[predicate.rest].object.push(newData.object);
                }else{
                    bnode.data[predicate.rest].object = [bnode.data[predicate.rest].object, newData.object]
                }
            }else{
                // single object for the same predicate, store as dictionary with predicate as key
                bnode.data[predicate.rest] = newData;
            }
        }
    }
    return { bnode, groupedEdges };
}

const findPredicate = (uri, predicates) => {
    let prefixData = Config.getPrefix(uri);
    for(var pred of predicates){
        if(pred.prefix === prefixData.prefix && pred.name === prefixData.rest){
            return pred;
        }
    }
    return undefined;
}