import Config from '../../config/config';
import { Query, DeleteInsert, DeleteInsertData } from './Sparql'

class RdfDAO {
    static async getNavigation() {
        return await Query({
            select: `?s (count(distinct ?o) as ?count)`,
            tripplePatterns: `?o a ?s .`,
            filterPatterns: `
                ?s IN (
                    ${Config.getTemplateClasses().map(s => `<${s}>`).join(',')}
                )`,
            groupBy: `?s`
        });
    }

    static async searchSimilarIndividual(prefix, search){
        return await Query({
            select: `?s (group_concat(DISTINCT ?type) as ?types)`,
            tripplePatterns: `
                ?s ?p ?o . 
                OPTIONAL { ?s a ?type . }
            `,
            filterPatterns: `regex(str(?s), "${prefix + search}", "i")`,
            groupBy: `?s`
        });
    }

    static async searchSubjectOfClass(cls, search) {
        return await Query({
            select: `DISTINCT ?o`,
            tripplePatterns: `
                ?o a <${cls}> .
                ?o (a|!a) ?p .
            `,
            filterPatterns: `
                isLiteral(?p) &&
                (regex(str(?o), "${search}", "i") || regex(str(?p), "${search}", "i"))
            `,
        }); 
    }
    
    static #prepareSubjectArgument = (subject) => {
        switch(subject.type) {
            case 'uri':
                return `<${subject.value}>`;
            case 'bnode':
                return `_:${subject.value}`;
            case 'literal':
                return `"${subject.value}"`;
            default:
                return subject.value;
        }
    }


    static async getTreeFromSubject(active_location) {
        if(active_location.type === 'bnode') {
            return await Query({
                select: `?s ?p ?o `,
                tripplePatterns: `
                    ${this.#prepareSubjectArgument(active_location.subject)} <${active_location.predicate.uri}> _:b .
                    _:b (a|!a)* ?s .
                    ?s ?p ?o .
                `
            });
        }else{
            return await Query({
                select: `*`,
                tripplePatterns: `
                    ${this.#prepareSubjectArgument(active_location)} (a|!a)* ?s .
                    ?s ?p ?o .
                `
            });
        }

        
        
       
        
    }

    static async getTreeFromPredicate(subject, predicate) {
        return await Query({
            select: `?s ?p ?o`,
            tripplePatterns: `
                ${subject} ${predicate} ?s2 .
                ?s2 (a|!a)* ?s .
                ?s ?p ?o .
            `
        });
    }

    static async getIndividual(subject) {
        return await Query({
            select: `?s ?p ?o`,
            tripplePatterns: `
            {
                BIND(${subject} as ?s)
                ?s ?p ?o . 
            }
            UNION
            {
                BIND(${subject} as ?sb)
                ?sb ?p2 ?bnode .
                ?bnode (<>|!<>)* ?s .
                ?s ?p ?o . 
                FILTER (isBlank(?bnode) && (isLiteral(?s) || isBlank(?s))) 
            }
        `
        });
    }


    static async insertIndividual(uri, type) {
        return await DeleteInsertData({
            insertData: `<${uri}> a <${type}>`,
        });
    }


    static async updateIndividualURI(oldURI, newURI) {
        return await DeleteInsert({   
            delete: ` 
                ?sIn ?pIn ?oldURI .
                ?oldURI ?pOut ?oOut . `,
            insert: `
                ?sIn ?pIn ?newURI .
                ?newURI ?pOut ?oOut . `,
            tripplePatterns: `
                { ?sIn ?pIn ?oldURI . }
                UNION
                { ?oldURI ?pOut ?oOut . }`,
            filterPatterns: `?oldURI = URI('''${oldURI}''')`,
            bind: `URI('''${newURI}''') AS ?newURI`
        });
    }

    static async deleteIndividualURI(uri) {
        return await DeleteInsert({
            delete: `
                ?sIn ?pIn ?uri .
                ?uri ?pOut ?oOut . 
                ?sBn ?pBn ?oBn . 
            `,
            tripplePatterns: `
            { 
                BIND(<${uri}> AS ?uri)
                ?sIn ?pIn ?uri .  
            }
            UNION
            { 
                BIND(<${uri}> AS ?uri)             
                ?uri ?pOut ?oOut . 
            }
            UNION
            {
                <${uri}> ?p ?bnode .
                ?bnode (<>|!<>)* ?sBn .
                ?sBn ?pBn ?oBn . 
                FILTER (isBlank(?bnode) && (isLiteral(?sBn) || isBlank(?sBn))) 
            }   
                `
        });
    }

    static async updateLiteral(subject, predicate, oldValue, newValue, type) {
        return await DeleteInsertData({   
            deleteData: `${subject} ${predicate} '''${oldValue}'''${(type && `^^${type}`) || ''}`,
            insertData: `${subject} ${predicate} '''${newValue}'''${(type && `^^${type}`) || ''}`,
        });
    }

    static async deleteLiteral(subject, predicate, value, type) {
        return await DeleteInsertData({   
            deleteData: `${subject} ${predicate} '''${value}'''${(type && `^^${type}`) || ''}`,
        });
    }

    static async insertLiteral(subject, predicate, value, type) {
        return await DeleteInsertData({
            insertData: `${subject} ${predicate} '''${value}'''${(type && `^^${type}`) || ''}`
        });
    }

    static async insertUri(subject, predicate, object) {
        return await DeleteInsertData({
            insertData: `${subject} ${predicate} ${object}`
        });
    }

    static async deleteUri(subject, predicate, object) {
        return await DeleteInsertData({
            deleteData: `${subject} ${predicate} ${object}`
        });
    }

    static async updatePredicate(subject, oldPredicate, newPredicate, object) {
        return await DeleteInsertData({
            deleteData: `${subject} ${oldPredicate} ${object}`,
            insertData: `${subject} ${newPredicate} ${object}`
        });
    }

    static async updateBnodeIndividual(subject, predicate, bnode) {

        const triplePatterns = (bnode) => {
            let r = `[`;
            for(const d in bnode.data) {
                let bnodeProperty = bnode.data[d];
                if(bnodeProperty.bnode_type === 'bnode-link'){
                    if(Array.isArray(bnodeProperty.object)){
                        for(const b of bnodeProperty.object) {
                            let objectArgument = `'''${b}'''^^<${bnodeProperty.datatype}>`;
                            r += `<${bnodeProperty.predicate}> ${objectArgument} ;`;
                        }
                    }else{
                        let objectArgument = bnodeProperty.type === 'uri' ? `<${bnodeProperty.object}>` : `'''${bnodeProperty.object}'''^^<${bnodeProperty.datatype}>`;
                        r += `<${bnodeProperty.predicate}> ${objectArgument} ;`;
                    }
                }else if(bnodeProperty.bnode_type === 'bnode-individual'){
                    r += `<${bnodeProperty.predicate}> ${triplePatterns(bnodeProperty)}`;
                }
            }
            return r + `]`;
        } 
        
        return await DeleteInsert({
            delete: `
                ?s ?p ?o .
                ?s ?p ?bnode .    
            `,
            tripplePatterns:`
               {
                    ${subject} <${predicate}> ?bnode .
                    ?s ?p ?bnode .
               }
               UNION 
               {
                    ${subject} <${predicate}> ?bnode .
                    ?bnode (<>|!<>)* ?s .
                    ?s ?p ?o .
                    FILTER (isBlank(?o) || isLiteral(?o)) 
               }
            `,
            insertData: `${subject} ${`<${predicate}> ${triplePatterns(bnode)}`}`
        });
    }
    
    static async deleteBnodeIndividual(subject, predicate, bnode) {
        
        return await DeleteInsert({
            delete: `
                ?s ?p ?o .
                ?s ?p ?bnode .    
            `,
            tripplePatterns:`
            {
                ${subject} <${predicate}> ?bnode .
                ?s ?p ?bnode .
           }
           UNION 
           {
                ${subject} <${predicate}> ?bnode .
                ?bnode (<>|!<>)* ?s .
                ?s ?p ?o .
                FILTER (isBlank(?o) || isLiteral(?o)) 
           }
            `
        });
    }
}

export default RdfDAO;