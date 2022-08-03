import React, {useState, useEffect} from 'react';
import Repository from '../../core/dal/Repository';
import RdfFactory from '../../core/factories/RdfFactory';
import URI from '../../common/URI';
import Config from '../../config/config';

const AssetPanel = () => {
    const [ classes, setClasses ] = useState();

    useEffect(() => {
        if(!classes){
            setClasses(Config.getTemplateClasses());
        }
    }, [classes, setClasses]);

    const onDragStart = (event, type) => {
        let node = RdfFactory.makeEmptyIndividual(type);
        event.dataTransfer.setData('application/nodeData', JSON.stringify(node));
        event.dataTransfer.effectAllowed = 'move';
      };
    return (
        <aside className={`asset-panel`} data-testid="asset-panel">
            <section className='asset-panel-handle'>
                Asset Panel
            </section>
            <section className='asset-panel-body'>
                <b>Drag and drop</b> Create a new individual of a particular template type or link an existing resource into the workspace.
                <section className='assets-container'>
                { classes && classes.map(function(s, index){
                    return (
                        <section draggable key={index} data-testid="dndnode" className="dndnode" onDragStart={(event) => onDragStart(event, s)}>
                            <section className="drag-handle"></section>
                            <URI value={s} applyPrefix={true} />
                        </section>
                    )
                })}
                </section>
            </section>
        </aside>
    )
}

export default AssetPanel;