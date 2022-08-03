import React, { useEffect, useState, useCallback, useContext, useRef } from "react";
import ReactFlow, { addEdge, Background  } from 'react-flow-renderer';
import NodeUpdate from './nodes/NodeUpdate';
import NodeCreate from './nodes/NodeCreate';
import NodeBlank from "./nodes/NodeBlank";
import EdgeUpdate from './edges/EdgeUpdate';
import EdgeCreate from './edges/EdgeCreate';
import AssetPanel from './AssetPanel';
import { MainContext } from '../../context/MainContext';
import FlowFactory from "../../core/factories/FlowFactory";

const nodeTypes = { 
  nodeUpdate: NodeUpdate,
  nodeCreate: NodeCreate,
  nodeBlank: NodeBlank
};

const edgeTypes = {
  edgeUpdate: EdgeUpdate,
  edgeCreate: EdgeCreate,
};

const Workspace = ({ graphData }) => {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } = useContext(MainContext);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    if(!graphData){
      setNodes([]);
      setEdges([]);
      return;
    }
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
  }, [graphData, setNodes, setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      let nodeData = event.dataTransfer.getData('application/nodeData');
      if(nodeData){
        const data = JSON.parse(nodeData);

        // check if the dropped element is valid
        if (typeof data === 'undefined' || !data) {
          return;
        }
        let position = {
          x: event.clientX,
          y: event.clientY
        };
        if(reactFlowInstance){
          position = reactFlowInstance.project({
            x: event.clientX,
            y: event.clientY,
          });
        }
        setNodes((nds) => nds.concat(FlowFactory.makeNodeCreate(data, position)));
      }
    },
    [reactFlowInstance, setNodes]
  );

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  return (
      <section className="editing-graph" data-testid="workspace-container" style={{ 
        height: '100vh', 
        width: '100vw',
        minWidth: '300px',
        minHeight: '300px',
      }}>
          { nodes && edges && <ReactFlow 
            data-testid="workspace-reactflow"
            nodes={nodes} 
            edges={edges}  
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            minZoom={0.1}
            maxZoom={3}

            >
              <Background />
            </ReactFlow> }
            <AssetPanel />
      </section>
  )
}

export default Workspace;