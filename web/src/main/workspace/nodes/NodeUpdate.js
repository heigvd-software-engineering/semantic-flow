import React, { useState, useCallback, useEffect, memo, useContext } from 'react';
import { MainContext } from '../../../context/MainContext';

import Attribute from '../attribute/Attribute';
import NodeHeader from './NodeHeader';
import FlowFactory from '../../../core/factories/FlowFactory';
import Message from '../../../ui/Message';
import Config from '../../../config/config';
import HandleSource from './handles/HandleSource';
import HandleTarget from './handles/HandleTarget';


const initSubject = (data, setValue) => {
    let v = Config.getPrefix(data.value);
    setValue({
        prefix: v.prefix,
        input: v.rest,
        data: {
            type: data.type,
            value: data.type === 'uri' ? v.uri : data.value
        }
    });
}

const NodeUpdate = ({data}) => {
    const { edges, setEdges } = useContext(MainContext);
    const [ subject, setSubject ] = useState(undefined);
    const [ view_mode ] = useState(data.templates.length > 0 ? 'template-known' : 'template-unknown');

    useEffect(() => {
        if(data && data.attributes){ 
            initSubject(data, setSubject);
        }
    }, [data]);

    const handleTargetDrop = useCallback((source, target) => {
        // add new edge
        let newEdges = [...edges];
        let createEdge = FlowFactory.makeEdgeCreate(source, "", target);
        newEdges.push(createEdge);
        setEdges(newEdges);
    }, [edges, setEdges]);


    return (
        <section className={`node ${view_mode} ${data.type}`} data-testid="node-update">
            <section className='node-drag-zone'>
            { data && (
                <>
                <NodeHeader 
                    data={data} 
                    setSubject={setSubject}
                    readonly={view_mode !== 'template-known' || data.type==='bnode'} 
                />
                
                <section className="node-body">
                    
                    {(
                        subject && data.attributes && data.attributes.map((attribute, index) => (
                            <Attribute 
                                key={index} 
                                subject={subject.data}
                                attribute={attribute}
                            />
                        ))
                    )}
                    {
                        view_mode === 'template-unknown' && (
                            <Message 
                                type="warning"
                                title="Template Unknown"
                                content="This resource is not linked to any templates. The fields are readonly. You can still manage its types and relations with other individuals." 
                            />
                        )
                    }
                </section>
            </>
            )}
            </section>
            <HandleSource data={data} />
            <HandleTarget data={data} handleTargetDrop={handleTargetDrop} />
        </section>
    )
}



export default memo(NodeUpdate);