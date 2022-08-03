import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../context/MainContext';
import Repository from '../core/dal/Repository';
import Workspace from "./workspace/Workspace";
import RawGraph from './raw_graph/RawGraph';

const Main = () => {
    const { main: {active_location, view_mode } } = useContext(MainContext);
    
    const [ graphDataEditor, setGraphDataEditor ] = useState(undefined);
    const [ graphDataRaw, setGraphDataRaw ] = useState(undefined);

    useEffect(() => {
        setGraphDataEditor(undefined);
        setGraphDataRaw(undefined);
        if(!active_location){
            return;
        }
        switch(view_mode){
            case 'workspace':
                (async () => {
                    setGraphDataEditor(await Repository.getReactFlowData(active_location));
                })();
                break;
            case 'raw':
                (async () => {
                    setGraphDataRaw(await Repository.getRawGraphData(active_location));
                })();
                break;
            default:
                setGraphDataEditor(undefined);
                setGraphDataRaw(undefined);
        }
    } , [active_location, view_mode]);

    return (
        <section className="editor">
            {  
                (
                    graphDataRaw && 
                        (
                            view_mode === 'raw' && 
                            <RawGraph graphData={graphDataRaw} />
                        )
                )
               ||
               (
                
                    (
                        view_mode === 'workspace' && 
                        <Workspace graphData={graphDataEditor} />
                    )
                )
         }
        </section>
    )
}

export default Main;
