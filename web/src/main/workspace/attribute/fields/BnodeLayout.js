import React, {useContext} from "react"
import SpatialLatLonEditor from "./editors/bnode/SpatialLatLonEditor";
import UncertainAroundDateEditor from "./editors/bnode/UncertainAroundDateEditor";
import UncertainPossibilitiesDateEditor from "./editors/bnode/UncertainPossibilitiesDateEditor";

import SpatialLatLonViewer from "./viewers/bnode/SpatialLatLonViewer";
import UncertainAroundDateViewer from "./viewers/bnode/UncertainAroundDateViewer";
import UncertainPossibilitiesDateViewer from "./viewers/bnode/UncertainPossibilitiesDateViewer";
import { MainContext } from "../../../../context/MainContext";
import Tinybutton from "../../../../ui/TinyButton";

import bnodes from '../../../../config/bnodes.json';

const BnodeLayout = ({subject, predicate, bnode, mode, editor, index, onChange}) => {    
    
    const { dispatch } = useContext(MainContext);
    return (
        <>
        {
            bnode && editor && (
                <section className={`bnode-field ${editor}`}>
                <section className="title">
                    <section className="bnode-type">
                        {bnodes[editor].meta.icon && <section className={`bnode-icon ${bnodes[editor].meta.icon}`}></section>}
                        {bnodes[editor].meta.title}
                    </section>
                    <section className="bnode-label">
                        <section>b-node: <b>{bnode.label}</b></section>
                        <Tinybutton 
                            title="Focus to this bnode"
                            name="focus-individual"
                            onClick={() => {
                                dispatch({
                                    type: 'workspace-focus',
                                    individual: {
                                        type: 'bnode',
                                        subject:subject,
                                        predicate:predicate,
                                        value: 'bnode-focus'
                                    },
                                    
                                });
                            }}
                        />
                    </section>
                </section>
                <section className="bnode-body">
                    {
                        (
                            editor === 'spatial-lat-lon' && (
                                (
                                    (mode === 'edit' && (
                                        <SpatialLatLonEditor
                                            key={index}
                                            index={index}
                                            bnode={bnode}
                                            onChange={onChange}
                                        />
                                    ))
                                    || 
                                    (mode === 'view' && (
                                        <SpatialLatLonViewer 
                                            key={index}     
                                            bnode={bnode} 
                                        />
                                    ))
                                )
                            )
                        ) || (
                            editor === 'uncertain-around-date' && (
                                (
                                    (mode === 'edit' && (
                                        <UncertainAroundDateEditor
                                            key={index}
                                            index={index}
                                            bnode={bnode} 
                                            onChange={onChange}
                                        />
                                    )) 
                                ||                                     
                                    (mode === 'view' && (
                                        <UncertainAroundDateViewer 
                                            key={index}
                                            bnode={bnode} 
                                        />
                                    ))
                                )
                            )
                        ) || (
                            editor === 'uncertain-possibilities-date' && (
                                (
                                    (mode === 'edit' && (
                                        <UncertainPossibilitiesDateEditor 
                                            key={index}
                                            index={index}
                                            bnode={bnode} 
                                            onChange={onChange}
                                        />
                                    )) 
                                ||                                     
                                    (mode === 'view' && (
                                        <UncertainPossibilitiesDateViewer 
                                            key={index}
                                            bnode={bnode} 
                                        />
                                    ))
                                )
                            )
                        )
                    
                    }
                </section>
            </section>
            )

        }</>
    )
}

export default BnodeLayout