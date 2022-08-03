import React from "react";
import Config from "../config/config";

const display = (value, applyPrefix) => {
    if(applyPrefix && value){
        let applied = Config.getPrefix(value);
        if(applied.prefix){
            return `${applied.prefix}:${applied.rest}`;
        }
    }
    return `<${value}>`;
}

const URI = ({value, applyPrefix, textOnly}) => {
    return(
        <>{
            (
                textOnly && display(value, applyPrefix)
            ) 
                || 
            (
                !textOnly && <span className="object uri" title={`<${value}>`}>{display(value, applyPrefix)}</span>
            )
            }
        </>
    )
};

export default URI;