import React, { useEffect, useReducer, useCallback} from 'react';
import { fieldStateReducer } from '../../../../reducers/fieldStateReducer';
import bnodeTemplates from '../../../../config/bnodes.json';

import BnodeLayout from './BnodeLayout';
import Repository from '../../../../core/dal/Repository';
import FieldToolbar from '../FieldToolbar';

const bnodeDeepCompare = (bnodeA, bnodeB) => {
    if((!bnodeA && !bnodeB) || (bnodeA && !bnodeB) || (!bnodeA && bnodeB)) {
        return false;
    }
    
    for(const prop in bnodeA){
        if(prop === 'meta'){
            continue;
        }
        if(!(bnodeA[prop] instanceof Object)){
            if(bnodeA[prop].toString() !== bnodeB[prop].toString()){
                return false;
            }
        }
        if(bnodeA[prop] instanceof Object){
            if(Array.isArray(bnodeA[prop])){
                if(!Array.isArray(bnodeB[prop])){
                    return false;
                }
                if(bnodeA[prop].length !== bnodeB[prop].length){
                    return false;
                }
                for(let i = 0; i < bnodeA[prop].length; i++){
                    if(bnodeA[prop][i].toString() !== bnodeB[prop][i].toString()){
                        return false;
                    }
                }
            }else{
                if(!bnodeDeepCompare(bnodeA[prop], bnodeB[prop])){
                    return false;
                }
            }
        }
    }    
    return true;
}

const BnodeField = ({subject, predicate, bnodes, editor, onChange, onSave}) => {
    const [state, dispatch] = useReducer(fieldStateReducer, undefined); // multivalued states used for editing of the attribute

    useEffect(() => {
        if(!state){
            dispatch({type: 'init-bnode-states', states: bnodes});
        }
    }, [state, bnodes]);

    const onBnodeChange = useCallback((bnodeStatus) => {
        let bnodeA = state.states[0].value.initial;
        let bnodeB = state.states[0].value.current;
        let fieldStatus = bnodeDeepCompare(bnodeA, bnodeB) ? 'saved' : 'unsaved';
        dispatch({type: 'bnode-field-change', status: {
            fieldStatus,
            bnodeStatus
        }});        
        onChange(fieldStatus);
    }, [dispatch, onChange, state]);

    const cancelClick = useCallback((ev) => { 
        ev.stopPropagation();
        onChange('canceled');
    }, [onChange]);

    const addEmptyBnode = useCallback(() => {
        dispatch({type: 'add-bnode-state', state: bnodeTemplates[editor]});
    }, [dispatch, editor]);

    useEffect(() => {
        if(state && state.states.length === 0){
            addEmptyBnode();
        }
    }, [state, addEmptyBnode]);

    const saveClick = useCallback(() => {
        (async () => {
            let newObjects;
            if(state.bnodeStatus === 'updated'){
                await Repository.updateBnodeAttribute(
                    subject,
                    predicate.uri,
                    state.states
                );
                newObjects = state.states.map(s => s.value.current);

            }else if(state.bnodeStatus === 'deleted'){
                await Repository.deleteBnodeAttribute(
                    subject,
                    predicate.uri,
                    state.states
                );
                newObjects = [];
            }else if(state.bnodeStatus === 'initial'){
                newObjects = state.states.map(s => s.value.initial);
            }

            onSave(newObjects);
        })();
    }, [state, onSave, subject, predicate]);

    

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
            state && state.states.map((bnode, index) => (
            <BnodeLayout
                key={index}
                index={index}
                subject={subject}
                predicate={predicate}
                bnode={bnode.value} 
                mode={'edit'}
                editor={editor}
                onChange={onBnodeChange}  
            />          
            ))
        }       
        </>
    )
}

export default BnodeField;