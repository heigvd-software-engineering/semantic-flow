import React, { createContext, useReducer } from 'react';
import { useNodesState, useEdgesState } from 'react-flow-renderer';
import { mainContextReducer } from '../reducers/mainContextReducer';

export const MainContext = createContext();

export const MainProvider = ({ children }) => {
    const [main, dispatch] = useReducer(mainContextReducer, {
        view_mode: 'workspace',
        workspace_breadcrumbs: [],
        recent_individuals: [],
        dialog: null
    });

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    return (
        <MainContext.Provider value={{ 
            main, 
            dispatch, 
            nodes, setNodes, 
            edges, setEdges,
            onNodesChange, onEdgesChange
            }}>
            { children}
        </MainContext.Provider>
    );
};
