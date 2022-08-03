import React, { useState, useCallback, useEffect, useContext, memo } from 'react';
import URI from '../../../common/URI';
import SearchResults from '../../../ui/SearchResults';
import Repository from '../../../core/dal/Repository';
import Config from '../../../config/config';
import { debounceInput } from '../../../utils/utils';
import { MainContext } from '../../../context/MainContext';
import { nodePositioning } from '../../../core/converters';
import Message from '../../../ui/Message';
import URIInput from '../../../ui/URIInput';

const renderResultElement = (result, index, click) => 
    <li className='similar' key={index} onClick={() => click(result)}>
        <URI value={result.s.value} applyPrefix={true} />        
        <section className='types'>{
            result.types.values && result.types.values.prefixed.map( (o, i) => {
                return <span key={i}>{o}</span>
            })
        }</section>
    </li>

const getMissingTypes = (typesA, typesB) => {
    return typesB ? typesA.filter(t => !typesB.includes(t.value)) : typesA;
}

const setAsActive = (value, active_individual, dispatch) => {
    // when adding a node to an empty workspace, we open the newly created individual
    if(!active_individual || !active_individual.value){
        dispatch({ type: 'open-individual', individual: {
            type: 'uri',
            value: value.uri
        } });
    }    
}

const NodeCreate = ({ data: initial }) => {

    const { main: { active_individual }, dispatch, nodes, edges, setNodes, setEdges } = useContext(MainContext);

    const [ uriMode, setUriMode ] = useState('create-uri');  

    const [ similars, setSimilars ] = useState([]);              // list of similar ressources based on current uri

    const [ value, setValue ] = useState({
        prefix: initial.templates[0].prefix,
        input: initial.value,
        uri: ''
    });             
    // value of the search bar -> uri without prefix
    const [ types, setTypes ] = useState([]);         
    const [ missingTypes, setMissingTypes ] = useState([]);    

    const debounceUri = useCallback(
        debounceInput(async (val) => {
            setValue({
                ...value,
                input: val,
                uri: Config.getUri(value.prefix, val)
            });
        }),
        [setValue, value.prefix, debounceInput]
    );

    useEffect(() => {
        if(initial){
            let type = initial.attributes.find((a) => a.predicate.uri === Config.getTypePredicate());
            setTypes(type.objects);
        }
    }, [initial]);

    useEffect(() => {
        setMissingTypes([]);
    }, [uriMode, setMissingTypes]);

    useEffect(() => {
        // when the value input changes, we search for similar individuals
        value.input.length >= 3 && (async () => {
            setSimilars(await Repository.searchSimilarIndividual(value.prefix, value.input));
        })();
    }, [value.input, value.prefix, setSimilars]);

    useEffect(() => {
        // find in similars and adapt the uri mode
        if(similars && similars.length > 0 && uriMode !== 'view-uri' ){
            let exists = similars.find(({s}) => s.value === Config.getUri(value.prefix, value.input));
            setUriMode(exists ? 'link-uri' : 'create-uri');
            if(exists){
                let missing = getMissingTypes(types, exists.types.value);
                setMissingTypes(missing);
            }else{
                setMissingTypes([]);
            }
        }else{
            setMissingTypes([]);
        }

    }, [value.input, value.prefix, similars, uriMode, types]);

    const onSearchClick = useCallback((result) => {
        // when the user clicks on a similar individual, we set it as value of uri input
        // the user is willing to link the node to this individual
        let prefixUri = Config.getUri(value.prefix, '');
        setValue({
            ...value,
            input: result.s.value.replace(prefixUri, ''),
            uri: result.s.value
        });
    }, [setValue, value]);
    
    const onValueChange = useCallback((pref, val) => {
        setValue({
            prefix: pref,
            input: val,
            uri: Config.getUri(pref, val)
        });
    }, [setValue]);

    const createNodeClick = useCallback(() => {
        if(value.input.length > 0) {
            switch(uriMode){
                case 'create-uri':
                    (async () => {
                        await Repository.insertIndividual(value.uri, types);
                        
                        // remove the insert node from the graph
                        let insertNode = nodes[nodes.length - 1];
                        nodes.splice(nodes.findIndex(node => node.id === insertNode.id), 1);
                        setNodes([...nodes, {
                            ...insertNode,
                            type: 'nodeUpdate',
                            data: {
                                ...insertNode.data,
                                value: value.uri
                            }
                        }]);
                        setAsActive(value, active_individual, dispatch);
                    })();
                    break;
                case 'link-uri':
                    (async () => {
                        let linkData = await Repository.getReactFlowData({
                            type: 'uri',
                            value: value.uri
                        });
                        
                        // remove the createNode from the graph
                        let createNode = nodes.find(n => n.id === initial.id);	
                        nodes.splice(nodes.findIndex(node => node.id === createNode.id), 1);
                        
                        // remove positions from new nodes, the nodes will be positioned later based on createNode position
                        linkData.nodes.forEach(node => delete node.position);

                        // position new nodes based on createNode node position
                        let data = nodePositioning({
                            nodes: [
                                ...nodes.filter(a => a.data.value !== createNode.id), 
                                ...linkData.nodes
                            ],
                            edges: [...edges, ...linkData.edges]
                        }, value.uri, createNode.position);
                        
                        setNodes(data.nodes);
                        setEdges(data.edges);
                        setAsActive(value, active_individual, dispatch);
                    })();
                    break;
                default:
            }  
            
        } 
    }, [value, uriMode, nodes, edges, setNodes, setEdges, types, initial, active_individual, dispatch]);

    return (
        <section className="node create node-drag-zone" data-testid="node-create">
            { initial && (
                <section className='node-body'>
                        <URIInput
                            prefix={value.prefix}
                            placeholder="Specify the individual URI"
                            setValue={onValueChange}
                            debounceUri={debounceUri}
                            value={value.input}
                        />
                        { value.input.length >= 3 && (
                        <section className='main'>{
                                (
                                similars && similars.length > 0 && (
                                    <section className='similar-ressources'>
                                        <b>You can chose an existing resource from the list. </b>
                                        <SearchResults 
                                            label="similar resources"
                                            click={onSearchClick}
                                            results={similars}
                                            renderResult={renderResultElement}  /> 
                                    </section>
                                )
                                )
                            }                               
                            <section className='create-mode-toolbar'>
                                <button 
                                    data-testid="button-create-link-uri"
                                    className='button' 
                                    onClick={createNodeClick}>
                                        {(uriMode === 'create-uri' && "CREATE") || (uriMode === 'link-uri' && "LINK")}
                                </button>
                                <span>{
                                    (uriMode === 'create-uri' && ("You are creating a new URI"))
                                    || 
                                    (uriMode === 'link-uri' && ("You are linking to an existing URI"))
                                }</span>
                            </section>
                            { missingTypes.length > 0 && (
                                <Message 
                                    type="warning"
                                    title="Resource does not match the selected type"
                                    content={
                                        <section>
                                            The selected Resource does not contains the following types: <br />
                                            { missingTypes.map((type, i) => <URI key={i} value={type.value} applyPrefix={true} />) }
                                        </section>
                                    }
                                />
                            )}
                        </section>

                      ) }  
                </section>         
            )}
        </section>
    )
}
export default memo(NodeCreate);