import RdfDAO from './RdfDAO';
import Config from '../../config/config';
import { reactFlowGraphDataConverter, rawGraphDataConverter  } from '../converters';

const replaceAnySpecialCharacters = (str) => {
    return str.replaceAll(/[^a-zA-Z0-9]/g, '.');
}


class Repository {
    
    static async getNavigation() {
        let data = await RdfDAO.getNavigation();
        Config.getTemplateClasses().forEach(cls => {
            if(!data.find(({s}) => s.value === cls)) {
                data.push({
                    s: {
                        value: cls,
                        type: 'uri'
                    },
                    count: {
                        value: 0,
                        type:'literal',
                        datatype: 'http://www.w3.org/2001/XMLSchema#integer'
                    }
                });
            }                    
        });
        return data;
    }

    static async searchSimilarIndividual(prefix, uri) {
        return (await RdfDAO.searchSimilarIndividual(
            Config.getUri(prefix, ''), 
            replaceAnySpecialCharacters(uri)
        )).map(({s, types}) => ({
           s:s,
           types:{
            ...types,
            values: types ? {
                prefixed: types.value.split(" ").map((o) => {
                    let pref = Config.getPrefix(o);
                    return pref.prefix+":"+pref.rest;
                }),
                uris: types.value.split(" ")
            } : undefined
           }
        }));
    }  

    static async searchSubjectOfClass(cls, search) {
        return await RdfDAO.searchSubjectOfClass(
            cls, 
            replaceAnySpecialCharacters(search)
        );
    }

    static async getReactFlowData(active_location){
        if(!active_location){
            return {
                nodes: [],
                edges: []
            }
        }
        return reactFlowGraphDataConverter(
            await RdfDAO.getTreeFromSubject(active_location)
            , active_location.value
        );
    }

    static async updateReactFlowData(subject, oldGraph) {

        
        let subjectArgument = subject.type === 'uri' ? `<${subject.value}>` : subject.value;
        
        // Get all of the subjects triples
        let newTriples = (await RdfDAO.getIndividual(subjectArgument));
        // new graph is composed of the individual, its bnodes and its outbound triples, 
        // convert them to react flow format
        let newGraph = reactFlowGraphDataConverter(newTriples, subject.value);
        
        let oldNodes = oldGraph.nodes;
        
        // Find the individual's node of both graphs
        let newGraphUpdatedNode = newGraph.nodes.find(n => n.data.value === subject.value);
        let oldGraphUpdatedNode = oldGraph.nodes.find(n => n.data.value === subject.value);
        
        oldNodes = oldNodes.filter(n => n.id !== oldGraphUpdatedNode.id);
        let oldEdges = [];

        // the update might have removed the individual completely, so we need to check if it's still there
        if(newGraphUpdatedNode){
            // Update the individual's node in the old graph, the id of the individual's node changes
            newGraphUpdatedNode.position = oldGraphUpdatedNode.position;
            oldNodes.push(newGraphUpdatedNode);    
            
            // update the inbound and outbound edges to match new individual's node id
            let inboundEdges = oldGraph.edges.filter(e => e.target === oldGraphUpdatedNode.id);
            let outboundEdges = oldGraph.edges.filter(e => e.source === oldGraphUpdatedNode.id);
            oldEdges = oldGraph.edges.filter(e => e.source !== oldGraphUpdatedNode.id && e.target !== oldGraphUpdatedNode.id); 
            
            // update the inbound edges
            oldEdges = [...oldEdges, ...inboundEdges.map(e => ({
                ...e,
                id: `${Config.genEdgeId()}-${e.source}-${newGraphUpdatedNode.id}`,
                target: newGraphUpdatedNode.id
            }))];

            // update the outbound edges
            oldEdges = [...oldEdges, ...outboundEdges.map(e => ({
                ...e,
                id: `${Config.genEdgeId()}-${newGraphUpdatedNode.id}-${e.target}`,
                source: newGraphUpdatedNode.id
            }))];    
        }

        return {
            nodes: oldNodes,
            edges: oldEdges
        };
    }

    static async getRawGraphData(active_location){
        return rawGraphDataConverter(
            await RdfDAO.getTreeFromSubject(active_location)
        );
    }

    /*
        Updates the URI of an individual by deleting and inserting 
        all inbound and outbound predicates .
        @arg oldURI: the current URI of the instance
        @arg newURI: the new URI for the instance
        Acceptables formats : full uri or prefixed uri:
        - <http://stardog.com/tutorial/Wearing_and_Tearing> (uri)
        - prefix:Wearing_and_Tearing (using prefixes)
    */
    static async updateIndividualURI(oldURI, newURI) {
        return await RdfDAO.updateIndividualURI(oldURI, newURI);
    }

    static async deleteIndividualURI(uri)  {
        return await RdfDAO.deleteIndividualURI(uri);
    }

    static async getIndividual(individual) {
        return reactFlowGraphDataConverter(
            (await RdfDAO.getIndividual(`<${individual}>`)).map((triple) => ({
                ...triple,
                s: {
                    type: 'uri',
                    value: individual
                }}))
            , individual);
    }

    static async insertIndividual(uri, types){
        for(const type of types){
            await RdfDAO.insertIndividual(uri, type.value);
        }
    }

    static async insertPredicate(subject, predicate, object) {
        return await RdfDAO.insertUri(`<${subject.value}>`, `<${predicate}>`, `<${object.value}>`);
    }

    static async deletePredicate(subject, predicate, object) {
        return await RdfDAO.deleteUri(`<${subject.value}>`, `<${predicate}>`, `<${object.value}>`);
    }

    static async updatePredicate(subject, oldPredicate, newPredicate, object) {
        return await RdfDAO.updatePredicate(`<${subject.value}>`, `<${oldPredicate}>`, `<${newPredicate}>`, `<${object.value}>`);
    }



    /*
        Updates a literal value of an individual
        
        @arg subject: the URI of the instance
        @arg predicate: the URI of the predicate
        @arg newValue: the new value for the literal
    */
    static async updateLiteral(subject, predicate, oldValue, newValue, type) {       
        return oldValue !== newValue && await RdfDAO.updateLiteral(
            subject,	
            `<${predicate}>`,	
            oldValue,
            newValue,
            type
        );
    }

    static async insertLiteral(subject, predicate, value, type) {
        return await RdfDAO.insertLiteral(
            subject,
            `<${predicate}>`,
            value,
            type
        );
    }

    static async updateLiteralAttribute(subject, predicate, states) {
        let subjectArgument = subject.type === 'uri' ? `<${subject.value}>` : subject.value;
        for(let state of states) {
            let pref, type;
            if(state.object && state.object.datatype){
                // prefer original object datatype than template datatype
                pref = Config.getPrefix(state.object.datatype);
                type = `${pref.prefix}:${pref.rest}`;
            }else{
                pref = Config.getPrefix(state.datatype);
                type = `${pref.prefix}:${pref.rest}`;
            }  
            if(state.value.current === ""){
                await RdfDAO.deleteLiteral(
                    subjectArgument, 
                    `<${predicate}>`,
                    state.value.initial,
                    type
                );
            } else{
                let initial = state.value.initial;
                let current = state.value.current;  

                if(initial === ''){
                    // insert new literal
                    await this.insertLiteral(
                        subjectArgument, 
                        predicate, 
                        current,
                        type
                    );
                }else{
                    // update existing literal
                    await this.updateLiteral(
                        subjectArgument, 
                        predicate, 
                        initial, 
                        current,
                        type
                    );
                }
            }
        }
    }

    static async updateUriSelectorAttribute(subject, predicate, states) {
        
        let changed = states.filter(s => s.value.current !== s.value.initial);
        let subjectArgument = subject.type === 'uri' ? `<${subject.value}>` : subject.value;
        for(let { value : { current }, object } of changed) {
            if(!current){
                await RdfDAO.deleteUri(subjectArgument, `<${predicate}>`, `<${object.value}>`);
            }else{
                await RdfDAO.insertUri(subjectArgument, `<${predicate}>`, `<${object.value}>`);
            }
        }
    }

    static async updateBnodeAttribute(subject, predicate, states) {
        for(const state of states) {
            await RdfDAO.updateBnodeIndividual(`<${subject.value}>`, predicate, state.value.current);
        }
    }

    static async deleteBnodeAttribute(subject, predicate, states) {
        for(const state of states) {
            await RdfDAO.deleteBnodeIndividual(`<${subject.value}>`, predicate, state.value.current);
        }
    }

}


export default Repository;