import React, { useEffect, useState, useCallback } from 'react';
import LiteralField from './fields/LiteralField';
import SelectorField from './fields/SelectorField';
import BnodeField from './fields/BnodeField';
import ObjectListViewer from './fields/viewers/ObjectListViewer';
import BnodeListViewer from './fields/viewers/BnodeListViewer';
import Message from '../../../ui/Message';
import URI from '../../../common/URI';

const nextViewMode = (fieldStatus, states) => (fieldStatus === 'saved' || fieldStatus === 'canceled') ? states && states.length > 0 ? 'view' : 'missing' : 'edit';

const Attribute = ({subject, attribute:initial}) => {
    
    const [attribute, setAttribute] = useState(undefined); // initial, unsaved, saved, restored
    
    const [message, setMessage] = useState(undefined);  // to display messages within the attributes field
    
    useEffect(() => {
        if(!attribute){
            setAttribute({
                objects: initial.objects,
                editor: initial.predicate.template.editor,
                datatype: initial.datatype,
                view_mode: initial.objects.length === 0 ? 'missing' : 'view',
                status: 'saved'
            });    
        }
    }, [initial, attribute, setAttribute]);

    const onFieldSave = useCallback((states) => {
        // Field Save affects the attribute states and status
        // when saved, the states of the field become the states of the attribute
        setAttribute({
            ...attribute, 
            status: 'saved', 
            view_mode: nextViewMode('saved', states), 
            objects: states
        });
    }, [attribute, setAttribute]);
   
    const onFieldChange = useCallback((fieldStatus) => {
        // Field Change only affect the attribut status, not the states
        setAttribute({
            ...attribute, 
            status: fieldStatus, 
            view_mode: fieldStatus === 'canceled' ? (attribute.objects.length === 0 ? 'missing' : 'view') : attribute.view_mode
        });
    }, [setAttribute, attribute]);

    return(
        <>
        { attribute && 
        <section 
            data-testid="attribute-container"
            className={`node-attribute ${attribute.view_mode} ${attribute.status}`} 
            onClick={() => setAttribute({
                ...attribute,
                view_mode: 'edit'
            })}
            >
            <section className='node-attribute-header' data-testid="attribute-header">
                <section className="predicate">
                    <URI value={initial.predicate.uri} applyPrefix />
                </section>   
            </section>
                            
            <section className="field" data-testid="attribute-field"> 
            {
                message && (
                    <Message 
                        type={message.type}
                        content={message.content}
                    />
                )
            }  
            {
                (
                    (   
                        attribute.view_mode === "edit" &&
                        ( 
                           (
                            attribute.editor && attribute.editor.field === 'literal' && 
                            <LiteralField 
                                subject={subject}
                                predicate={initial.predicate}
                                objects={attribute.objects}
                                editor={attribute.editor.type} 
                                onChange={onFieldChange}
                                onSave={onFieldSave}
                                datatype={attribute.datatype.uri}
                            /> ) || (
                            attribute.editor && attribute.editor.field === 'selector' && 
                            <SelectorField 
                                subject={subject}
                                predicate={initial.predicate}
                                objects={attribute.objects}  
                                editor={attribute.editor.type} 
                                onChange={onFieldChange}
                                onSave={onFieldSave}
                            /> ) || (
                            attribute.editor && attribute.editor.field === 'bnode' && 
                            <BnodeField 
                                subject={subject} 
                                predicate={initial.predicate}
                                bnodes={attribute.objects}  
                                editor={attribute.editor.type} 
                                onChange={onFieldChange}
                                onSave={onFieldSave}
                            /> 
                            )
                            
                        )  
                    ) 
                    ||
                    ( 
                        attribute.view_mode === "view" &&
                        ((
                            (attribute.editor && attribute.objects && (attribute.editor.field === "literal" || attribute.editor.field === 'selector')) && (
                                <ObjectListViewer objects={attribute.objects} />
                            )
                        )
                        ||
                        (
                            attribute.editor && attribute.editor.field === "bnode" && attribute.objects && (
                                <BnodeListViewer 
                                    subject={subject} 
                                    predicate={initial.predicate}
                                    objects={attribute.objects} 
                                    editor={attribute.editor} />
                            )
                        ))
                    )
                    ||
                    (
                        attribute.view_mode === "missing" &&
                        <section className="add-attribute">
                            <section className='large-font'>+</section>
                        </section>
                    )
                            
                )
            }</section>
        </section>
        }
        </>
    )

}

export default Attribute;