import React, { useContext, useCallback } from "react";
import DropDown from "../ui/DropDown";
import { MainContext } from '../context/MainContext';

const modes = [
    <section className="select-view-mode view-mode-workspace" mode="workspace">Workspace</section>, 
    <section className="select-view-mode view-mode-raw-graph" mode="raw">Raw Graph</section>
];

const ViewMode = () => {
    const { main: { active_individual, view_mode }, dispatch } = useContext(MainContext);

    const switchViewMode = useCallback((mode) => {
        dispatch({ type: "switch-view-mode", view_mode: mode.props.mode });
    }, [dispatch]);

    const selected = useCallback(() => modes.find(mode => mode.props.mode === view_mode), [view_mode]);

    return (
        <section className="view-mode">
            { active_individual && 
            <DropDown 
                onChange={switchViewMode} 
                options={modes}
                selected={selected}
            />}
        </section>
    )
}

export default ViewMode;