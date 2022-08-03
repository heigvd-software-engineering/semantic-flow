import React, { useCallback, useState, useContext} from 'react';
import { useStore, getBezierPath, getEdgeCenter } from 'react-flow-renderer';

import URIForm from '../../../ui/URIForm';
import Config from '../../../config/config';
import Repository from '../../../core/dal/Repository';
import { MainContext } from '../../../context/MainContext';
import FlowFactory from '../../../core/factories/FlowFactory';

export default function EdgeCreate({
  id,
  source, 
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
    const [ value, setValue ] = useState({
      uri: Config.getMainPrefix(),
      prefix: Config.getMainPrefix(),
      input:''
    });
    const { edges, setEdges } = useContext(MainContext);
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

    const onSaveClick = useCallback(() => {
      (async () => {
        if(value.input.length > 0) {
          await Repository.insertPredicate(sourceNode.data, value.uri, targetNode.data);
          let newEdges = edges.filter(e => e.id !== id);
          let siblings = newEdges.filter(edge => edge.source === source && edge.target === target).length;
          let newEdge = FlowFactory.makeEdgeUpdate(sourceNode.data, {
            type: 'uri',
            value: value.uri
          }, targetNode.data, siblings);
          newEdges.push(newEdge);
          setEdges(newEdges);
        }
      })();
    }, [value, sourceNode, targetNode, edges, setEdges, id, source, target]);

    const onCancelClick = useCallback((ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      setEdges(edges.filter(e => e.id !== id));
    }, [edges, setEdges, id]);

    if (!sourceNode || !targetNode) {
      return null;
    }
  
    const edgePath = getBezierPath({
      sourceX: sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    const [edgeCenterX, edgeCenterY] = getEdgeCenter({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });

    const foreignObjectWidth = 200;
    const foreignObjectHeight = 300;   

  return (
    <>
    <g className='edge create'>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        
      />
       <foreignObject
        width={foreignObjectWidth}
        height={foreignObjectHeight}
        x={edgeCenterX - foreignObjectWidth / 2}
        y={edgeCenterY - foreignObjectHeight / 2}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <section className='edge-form' data-testid="edge-create-form">
        <URIForm 
            value={value}
            setValue={(v) => setValue(v)}
            clickSave={onSaveClick}
            clickCancel={onCancelClick}
          />
        </section>
      </foreignObject>
      </g>
    </>
  );
}