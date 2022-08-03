import React, { useEffect, useReducer, useCallback, useContext} from 'react';
import TypeSelector from './editors/TypeSelector';
import { fieldStateReducer } from '../../../../reducers/fieldStateReducer';
import FieldToolbar from '../FieldToolbar';
import Repository from '../../../../core/dal/Repository';
import { MainContext } from '../../../../context/MainContext';

const SelectorField = ({ subject, predicate, objects, editor, onChange, onSave}) => {
    const { nodes, edges, setNodes, setEdges } = useContext(MainContext);
    
    const [state, dispatch] = useReducer(fieldStateReducer, undefined); // multivalued states used for editing of the attribute

    useEffect(() => {
        if(!state){
            dispatch({type: 'init-selector-states', states: objects});
        }
    }, [state, objects]);

    useEffect(() => {
        if(state && state.status === 'changed'){
            onChange(
                state.states.some((s) => s.value.initial !== s.value.current) ? 'unsaved' : 'restored',
                state.states
            );
            dispatch({type: 'set-notified'}); // prevent infinite update loop
        }
    }, [state, onChange]);

    const onSeletorChange = useCallback((state) => {
        dispatch({type: 'selector-field-change', states: state});
    }, [dispatch]);

    const saveClick = useCallback(() => {
        (async () => {
            await Repository.updateUriSelectorAttribute(
                subject,
                predicate.uri, 
                state.states
            );
            if(editor === 'type-selector'){
                await (async () => {
                    let graphData = await Repository.updateReactFlowData(subject, {
                        nodes: nodes,
                        edges: edges
                    });
                    setNodes(graphData.nodes);
                    setEdges(graphData.edges);
                })();
            }
            onSave(state.states.filter(s => s.value.current).map(s => s.object));
        })();
    }, [subject, predicate, state, onSave, nodes, edges, setNodes, setEdges, editor]);

    const cancelClick = useCallback((ev) => { 
        ev.stopPropagation();
        // restore original objects 
        onChange('canceled');
    }, [onChange]);
        
    return (
        <>
         <FieldToolbar 
            saveClick={(ev) => {
                ev.stopPropagation();
                saveClick();
                }
            }
            cancelClick={cancelClick}
        />
        {
           (
            state && state.states && editor === 'type-selector' && 
                <TypeSelector 
                    states={state.states} 
                    onChange={onSeletorChange}
                />
            )
        }        
        </>
    )
}

export default SelectorField;