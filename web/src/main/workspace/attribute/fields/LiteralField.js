import React, { useEffect, useCallback, useReducer } from 'react';
import LiteralNumber from './editors/LiteralNumber';
import LiteralText from './editors/LiteralText';
import LiteralTextarea from './editors/LiteralTextarea';
import { fieldStateReducer } from '../../../../reducers/fieldStateReducer';
import FieldToolbar from '../FieldToolbar';
import Repository from '../../../../core/dal/Repository';

const LiteralField = ({ subject, predicate, objects, editor, onChange, onSave, datatype}) => {

    const [state, dispatch] = useReducer(fieldStateReducer, undefined); // multivalued states used for editing of the attribute

    useEffect(() => {
        if(!state){
            dispatch({type: 'init-literal-states', states: objects, datatype: datatype});
        }
    }, [state, objects, datatype]);

    useEffect(() => {
        if(state && state.status === 'changed'){
            let fieldStatus = state.states.some((s) => s.value.initial !== s.value.current) ? 'unsaved' : 'restored';
            onChange(fieldStatus);
            dispatch({type: 'set-notified'}); // prevent infinite update loop
        }
    }, [state, onChange]);
        

    const onLiteralChange = useCallback((index, state) => {
        dispatch({type: 'literal-field-change', index: index, value: state});
    }, [dispatch]);

    const addEmptyLiteral = useCallback(() => {
        dispatch({type: 'add-literal-state', state: {
            datatype: datatype,
            object: {
                type: 'literal',
            },
            value: {
                initial: '',
                current: ''
            }
        }});
    }, [dispatch, datatype]);

    useEffect(() => {
        if(state && state.states && state.states.length === 0){
            addEmptyLiteral();
        }
    }, [state, addEmptyLiteral]);

    const saveClick = useCallback((ev) => {
        (async () => {
            await Repository.updateLiteralAttribute(
                subject, 
                predicate.uri, 
                state.states.filter((s) => s.value.initial !== s.value.current) // take only changes ones
            );
            
            // removes empty states, removes states with same values, update the object value with current value
            let newStates = state.states
            .filter((s) => s.value.current !== '')
            .filter((s, index, self) => self.findIndex((t) => t.value.current === s.value.current) === index)
            .map((s) => ({ ...s.object, value: s.value.current}));

            onSave(newStates);

        })();
    }, [state, subject, predicate, onSave]);

    const cancelClick = useCallback((ev) => { 
        ev.stopPropagation();
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
           state && state.states && state.states.map((state, index) => 
            (
                (
                    editor === 'literal-number' && 
                    <LiteralNumber 
                        key={index}
                        value={state.value.current} 
                        datatype={state.datatype}
                        onChange={(state) => onLiteralChange(index, state)}
                    />
                ) ||
                (
                    editor === 'literal-text' &&
                    <LiteralText 
                        key={index}
                        value={state.value.current} 
                        onChange={(state) => onLiteralChange(index, state)}
                    />
                )||
                (
                    editor === 'literal-textarea' &&
                    <LiteralTextarea 
                        key={index}
                        value={state.value.current} 
                        onChange={(state) => onLiteralChange(index, state)}
                    />
                )
                ||
                (
                    editor === 'readonly' &&
                    <span key={index}>{state.value.current}</span>
                )
            )
           )
        }
        {
            editor !== 'readonly' && (
                <section className='insert-button' data-testid='literal-multivalue-add' onClick={addEmptyLiteral}>
                    <section className='plus'>+</section>
                </section>
            )
        }
        
        </>
    )
}

export default LiteralField;