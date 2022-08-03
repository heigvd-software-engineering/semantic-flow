import React from "react";
import BnodeLayout from "../BnodeLayout";

const BnodeListViewer = ({subject, predicate, objects, editor}) => {
    return(
        <>
        {
            editor && objects && objects.map((bnode, index) => (
            <BnodeLayout
                key={index}
                index={index}
                subject={subject}
                predicate={predicate}
                bnode={bnode} 
                mode={'view'}
                editor={editor.type}
            />          
            ))
        }       
        </>
    )
}

export default BnodeListViewer;