import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
import { ForceGraph2D } from 'react-force-graph';
const DetailsZoomFactor = 6;

const RawGraph = ({ graphData }) => {
    const fgRef = useRef();
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useLayoutEffect(() => {
      
      // resize canvas to fit window
      function updateSize() {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    },[]);

    
  const renderLink = useCallback((link, ctx, scale) => {
    const start = link.source;
    const end = link.target;
    
    let parallelEdges = graphData.links.filter(e => e.source === start && e.target === end);

    let myIndex = parallelEdges.findIndex(e => e.predicate === link.predicate);
   
    let mid = curveBetween2Points(
      ctx, start, 
      6 * myIndex, 
      end, scale);
    if(scale < DetailsZoomFactor) return;
  
    
      const relLink = { x: end.x - start.x, y: end.y - start.y };
    
      let textAngle = Math.atan2(relLink.y, relLink.x);
      // maintain label vertical orientation for legibility
      if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
      if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

      ctx.save();
      ctx.translate(mid.x, mid.y);
      ctx.rotate(textAngle);
      

      const fontSize = 1;
      ctx.font = `${fontSize}px Arial`;
      const textWidth = ctx.measureText(link.predicate).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
      
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(0 - bckgDimensions[0] / 2, 0 - bckgDimensions[1] / 2, ...bckgDimensions);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'darkgrey';

      ctx.fillText(link.predicate, 0, 0);
      ctx.restore();
    

  }, [graphData]);
  

    return (  
        <section className="raw-graph">
            { graphData && <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                /*
                d3AlphaDecay={0.15} //0.0228
                d3VelocityDecay={0.2} // 0.4
                */
                nodeCanvasObject={renderNode}
     
                linkCanvasObjectMode={()=> 'replace'}
                linkCanvasObject={renderLink}
                linkDirectionalArrowLength={2}
                linkDirectionalArrowRelPos={1}
                                
                onNodeDragEnd={node => {
                    node.fx = node.x;
                    node.fy = node.y;
                    node.fz = node.z;
                }}  
                width={size.width}
                height={size.height}                
                /> }
        </section>
    )
}


const renderNode = (node, ctx, globalScale) => {
    if(globalScale < DetailsZoomFactor) {
      ctx.beginPath();
      ctx.fillStyle = '#1976D2'
      ctx.strokeStyle = '#1976D2'
      ctx.arc(node.x, node.y, 1.5, 0, 2*Math.PI);
      ctx.fill();
      ctx.stroke();
      return;
    }
    const label = node.val.replace(/.+(.{80})/, "...$1");
    const fontSize = 12/globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
  
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(25, 118, 210, 1)';
    ctx.fillText(label, node.x, node.y);
  
    node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
  };
  
  
  const curveBetween2Points = (ctx, start, offset, end) => {
    let mid = {
      x: (start.x + offset + end.x) / 2, 
      y: (start.y + offset + end.y) / 2
    };
    
    ctx.beginPath();
    ctx.strokeStyle = '#616161';
    ctx.lineWidth = 0.05;
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
    ctx.stroke();
   
    return mid;
  }


export default RawGraph;