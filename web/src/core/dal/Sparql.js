import Config from '../../config/config';

const sparqlPrefixSection = () => Config.getPrefixes().map(([key, val]) => `PREFIX ${key}: <${val}>`);

class HTTP {
    static async Get(endpoint, graph, query) {
        const url = endpoint +
        '?query=' + encodeURIComponent(query) +
        '&format=json'+
        '&default-graph-uri=' + encodeURIComponent(graph);
        return await fetch(url);
    }

    static async Post(endpoint, graph, query) {
        return await fetch(endpoint, { 
            method:'POST', 
            headers: {
                'Content-Type': 'application/sparql-update'
            },
            body: query
        });
    }
}

export const Query = async (args) => {
    var bindings = undefined;
    let query = sparqlPrefixSection().join('\n') + `
        SELECT ${(args.select && `${args.select}`) || ''}
        WHERE { 
            ${(args.tripplePatterns && `${args.tripplePatterns}`) || ''} 
            ${(args.filterPatterns && `
                FILTER ( 
                    ${args.filterPatterns} 
                )
            `) || ''}
        }
        ${(args.groupBy && `GROUP BY ${args.groupBy}`) || ''}
    `;
    await HTTP.Get(Config.getQueryEndpoint(), Config.getGraph(), query)
    .then(response => response.json())
    .then(data => {
        bindings = data.results.bindings;
    });
    return bindings;
}

export const DeleteInsert = async (args) => {
    var bindings = undefined;
    let query = `${sparqlPrefixSection().join('\n')} 
    ${(args.delete &&
        `DELETE { 
            ${args.delete} 
        }`) || ''}
    ${(args.insert && 
        `INSERT { 
            ${args.insert} 
        }`) || ''}

    ${((!args.tripplePatterns && !args.filterPatterns && ";") || '')} 
    ${((args.tripplePatterns || args.filterPatterns) &&  
        `WHERE {
            ${(args.tripplePatterns && `${args.tripplePatterns}`) || ''} 
            ${(args.filterPatterns && `
                    FILTER ( 
                        ${args.filterPatterns} 
                    ) . 
            `) || ''}
            ${(args.bind && `
                    BIND ( 
                        ${args.bind} 
                    ) . 
            `) || ''}}
    `) || ''}
    ${(args.insertData && 
        `;INSERT Data { 
            ${args.insertData} 
        }`) || ''}`;

    await HTTP.Post(Config.getUpdateEndpoint(), Config.getGraph(), query);
    return bindings;
}

export const DeleteInsertData = async (args) => {
    var bindings = undefined;
    let query = sparqlPrefixSection().join('\n') + `
    ${(args.deleteData && `DELETE DATA { ${args.deleteData} };`) || ''}
    ${(args.insertData && `INSERT DATA { ${args.insertData} };`) || ''}
    `;
    await HTTP.Post(Config.getUpdateEndpoint(), Config.getGraph(), query);
    return bindings;
}