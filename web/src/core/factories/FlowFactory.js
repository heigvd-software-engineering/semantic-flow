import Config from "../../config/config";

class FlowFactory {

    static makeNodeUpdate(data, position){
        return FlowFactory.#makeNode(data, 'nodeUpdate', position);
    }

    static makeNodeBlank(data, position){
        return FlowFactory.#makeNode(data, 'nodeBlank', position);
    }

    static makeNodeCreate(data, position){
        return FlowFactory.#makeNode(data, 'nodeCreate', position);
    }
    
    static #makeNode(data, type, position){
        let nodeId = Config.genNodeId();
        data.id = nodeId;
        return {
            id: nodeId,
            type: type,
            dragHandle: '.node-drag-zone',   
            data: data,
            position
        }
    }

    static makeEdgeUpdate(s, p, t, siblings){
        return FlowFactory.#makeEdge(s, p, t, 'edgeUpdate', siblings);
    }

    static makeEdgeCreate(s, p, t){
        return FlowFactory.#makeEdge(s, p, t, 'edgeCreate');
    }

    static #makeEdge(s, p, t, type, siblings = 0){
        return {
            id: `${Config.genEdgeId()}-${s.id}-${t.id}`,
            source: s.id,
            target: t.id,
            type: type,
            data: {
                siblings: siblings,
                subject: s,
                predicate: p,
                object: t,
            }
        }
    }
}

export default FlowFactory;