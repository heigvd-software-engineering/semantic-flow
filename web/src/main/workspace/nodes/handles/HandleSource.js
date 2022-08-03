import React from "react";
import { Position  } from 'react-flow-renderer';

const HandleSource = ({data}) => {
    return (
        <section 
            id="aDrag"
            className='handle source'  
            data-testid="handle-source"
            draggable
            type="source" 
            position={Position.Right} 
            onDragStart={(event) => {
                event.stopPropagation();
                event.dataTransfer.setData('application/source', JSON.stringify(data));
                event.dataTransfer.effectAllowed = 'move';
            }}
        />
    )
}

export default HandleSource;