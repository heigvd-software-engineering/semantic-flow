import React, { useState, useCallback, useEffect, useContext } from 'react';
import URI from '../../../common/URI';
import { MainContext } from '../../../context/MainContext';
import URIForm from '../../../ui/URIForm';
import Config from '../../../config/config';
import Repository from '../../../core/dal/Repository';
import Message from '../../../ui/Message';
import Tinybutton from '../../../ui/TinyButton';

const initValue = (value, setValue) => {
    let v = Config.getPrefix(value);
    setValue({
        prefix: v.prefix,
        input: v.rest,
        uri: v.uri
    });
}

const NodeHeader = ({ data, setSubject, readonly }) => {
    const { main: {active_individual}, dispatch, nodes, setNodes } = useContext(MainContext);

    const [value, setValue] = useState(undefined);           
    const [mode, setMode] = useState('view');
    const [conflict, setConflict] = useState(false);

    useEffect(() => {
        initValue(data.value, setValue);
    }, [data.value, setValue]);

    const onSaveClick = useCallback((ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if(conflict){
            return;
        }
        if(value.input.length > 0) {
            (async () => {
                await Repository.updateIndividualURI(data.value, value.uri);
                if(active_individual.value === data.value) {
                    dispatch({
                        type: 'update-individual',
                        individual: {
                            type: 'uri',
                            value: value.uri,
                            old: data.value
                        }   
                    });
                }
                // update the node
                let newNodes = [...nodes];
                newNodes.find(n => n.data.value === data.value).data.value = value.uri;
                setNodes(newNodes);
                // update the subject
                initValue(value.uri, setSubject);
                setMode('view');
            })();
        }
        
    }, [data.value, value, conflict, dispatch, active_individual, nodes, setNodes, setSubject]);

    const onDeleteClick = useCallback((ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        (async () => {
            await Repository.deleteIndividualURI(data.value);
            if(active_individual.value === data.value) {
                dispatch({
                    type: 'delete-active-individual',
                    individual: {
                        type: 'uri',
                        value: '',
                        old: data.value
                    }
                });
            }else{
                dispatch({
                    type: 'delete-individual',
                    individual: data.value
                });
                setNodes(nodes.filter(node => node.id !== data.id));
            }
        })();
    }, [data, dispatch, active_individual, nodes, setNodes]);

    const onValueChange = useCallback((v) => {
        (async () => {
            setValue(v);
            setConflict(v.uri !== data.value && (await Repository.getIndividual(v.uri)).nodes.length > 0);
        })();
    }, [setValue, setConflict, data.value]);

    return (
        <section className={`node-header`}>
            <section className="node-header-body">
                {
                    ( mode === 'view' && value && (<section className='flex'>
                            <URI value={value.uri} applyPrefix={true} />
                            <section className='node-header-toolbar' >
                                { !readonly && (
                                    <Tinybutton 
                                        title="Manage this individual"
                                        name="manage-individual"
                                        onClick={() => {
                                            setMode('update');
                                        }}
                                    />
                                )}
                                <Tinybutton 
                                        title="Focus to this individual"
                                        name="focus-individual"
                                        onClick={() => {
                                            dispatch({
                                                type: 'workspace-focus',
                                                individual: {
                                                    type: 'uri',
                                                    value: value.uri
                                                }   
                                            });
                                        }}
                                    />
                            </section>
                        </section>)
                    )
                    ||
                    (
                        mode === 'update' && (<>
                            <URIForm 
                                value={value}
                                setValue={(value) => {
                                    onValueChange(value);
                                }}
                                clickCancel={() => {
                                    initValue(data.value, setValue);
                                    setMode('view');
                                }}
                                clickSave={onSaveClick}
                                clickDelete={onDeleteClick}
                            />
                            {  conflict && (
                                <section className='message-container'>
                                <Message 
                                    type="error"
                                    content={
                                        <section>
                                            You cannot change the URI of an individual to a URI that is already used by another individual.
                                        </section>
                                    }
                                />
                                </section>
                            ) }
                             
                        </>)
                    )
                    
                }
                
            </section>
        </section>
    )
}

export default NodeHeader;