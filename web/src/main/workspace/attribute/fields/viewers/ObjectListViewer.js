import React from "react";
import URI from "../../../../../common/URI";
import Literal from "../../../../../common/Literal";

const ObjectListViewer = ({objects}) => {
    return (
        objects && objects.map((object, index) => (
            (object.type === 'uri' && <URI key={index} value={object.value} applyPrefix={true} />)
            ||
            (object.type === 'literal' && <Literal key={index} value={object.value} datatype={object.datatype} />)               
        ))
    )
}

export default ObjectListViewer;

    