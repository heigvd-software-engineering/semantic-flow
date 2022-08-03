import React, { useState, useEffect, memo } from 'react';
import Config from '../../../config/config';
import Attribute from '../attribute/Attribute';
import NodeHeader from './NodeHeader';

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

const NodeBlank = ({data}) => {
    const [ subject, setSubject ] = useState(undefined);
    const [ attributes, setAttributes ] = useState([]);

    useEffect(() => {
        if(data && data.attributes){ 
            initSubject(data, setSubject);
            let newAttributes = [];
            for(let attribute of data.attributes){
                newAttributes.push({
                    ...attribute,
                    viewMode: 'view',
                    status: 'saved'
                });
            }
            setAttributes(newAttributes);
        }
    }, [data]);

    return (
        <section className={`node bnode node-drag-zone`}>
            { data && (
                <>
                <NodeHeader 
                    data={data} 
                    readonly={true} 
                />
                <section className="node-body">
                    
                    {(
                        attributes && attributes.map((attribute, index) => (
                            <Attribute 
                                key={index} 
                                subject={subject}
                                attribute={attribute}
                            />
                        ))
                    )}
    
                </section>
           
            </>
            )}
            <section 
                id="a"
                className='handle source'  
                type="source" 
                
                
            />
                
            <section 
                id="b" 
                className='handle target' 
                type="target"  
            />
        </section>
    )
}
export default memo(NodeBlank);