import React, {useEffect, useCallback, useState, useContext} from 'react';
import { useStore, getBezierPath, getEdgeCenter } from 'react-flow-renderer';
import { getEdgeParams } from './edgeUtils';
import URI from '../../../common/URI';
import URIForm from '../../../ui/URIForm';
import Config from '../../../config/config';
import Repository from '../../../core/dal/Repository';
import { MainContext } from '../../../context/MainContext';
import FlowFactory from '../../../core/factories/FlowFactory';

const calculateEdgeYOffet = (siblings) => ((siblings - (siblings % 2 ? 1 : 0) + 1) * 20 * (siblings % 2 ? -1 : 1));

export default function EdgeUpdate({
  id,
  source, 
  target,
  style = {},
  data,
  markerEnd,
}) {
    const [ active, setActive ] = useState(false);
    const [ value, setValue ] = useState(undefined);

    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
    const edgePath = getBezierPath({
        sourceX: sx,
        sourceY: sy + calculateEdgeYOffet(data.siblings),
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty + calculateEdgeYOffet(data.siblings),
    });

    const [edgeCenterX, edgeCenterY] = getEdgeCenter({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
    });


    useEffect(() => {
      if(!value){
        let val = Config.getPrefix(data.predicate.value);
        setValue({
            prefix: val.prefix,
            input: val.rest,
            uri: val.uri
          });
      }
    }, [data, value, setValue]);

    const { edges, setEdges } = useContext(MainContext);

    const onSaveClick = useCallback((ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      (async () => {
        if(value.input.length > 0) {
          await Repository.updatePredicate(sourceNode.data, data.predicate.value, value.uri, targetNode.data);
          let newEdges = edges.filter(e => e.id !== id);
          let newEdge = FlowFactory.makeEdgeUpdate(sourceNode.data, {
            type: 'uri',
            value: value.uri
          }, targetNode.data);
          newEdges.push(newEdge);
          setEdges(newEdges);
          setActive(false);
        }
      })();
    }, [value, sourceNode, targetNode, edges, setEdges, id, data.predicate]);

    const onDeleteClick = useCallback((ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      (async () => {
       await Repository.deletePredicate(sourceNode.data, data.predicate.value, targetNode.data);
        let newEdges = edges.filter(e => e.id !== id);
        setEdges(newEdges);
        setActive(false);
      })();
    }, [sourceNode, targetNode, edges, setEdges, id, data.predicate]);

    if (!sourceNode || !targetNode) {
      return null;
    }
  
    const foreignObjectWidth = 250;
    const foreignObjectHeight = 300; 

  return (
    <>
    <g className='edge' onClick={(ev) => {
      ev.stopPropagation();
      let readonly = sourceNode.data.type === 'bnode' || targetNode.data.type === 'bnode';
      !readonly && setActive(true);
    }}>
      <path
        id={id}
        
        style={style}
        className="react-flow__edge-path edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: '12px'}}
          startOffset="50%"
          textAnchor="middle"
          
        >
          <URI value={data.predicate.value} applyPrefix textOnly />
        </textPath>
      </text>
      { active && <foreignObject
        width={foreignObjectWidth}
        height={foreignObjectHeight}
        x={edgeCenterX - foreignObjectWidth / 2}
        y={edgeCenterY - foreignObjectHeight / 2}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <section data-testid="edge-update" className='edge-form'>
          <URIForm 
            value={value}
            setValue={(v) => setValue(v)}
            clickSave={onSaveClick}
            clickCancel={(ev) => {
              ev.stopPropagation();
              setActive(false);
            }}
            clickDelete={onDeleteClick}
          />
        </section>
      </foreignObject>}
      
      </g>
      </>
  );
}