import React from "react";
import { Position  } from 'react-flow-renderer';

const HandleTarget = ({data, handleTargetDrop}) => {
    return(
        <section 
                id="bDrop" 
                className='handle target' 
                data-testid="handle-target"
                type="target" 
                position={Position.Left} 
                onDrop={(event) => {
                    event.stopPropagation();
                    const source = JSON.parse(event.dataTransfer.getData('application/source'));
                    handleTargetDrop(source, data);
                    
                }}
                
            />
    )
}

export default HandleTarget;