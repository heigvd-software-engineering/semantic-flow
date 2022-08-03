import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';

import Class from './Class';
import URI from '../../common/URI';
import { MainContext } from '../../context/MainContext';

import Repository from '../../core/dal/Repository';
import ActiveIndividualSelector from './ActiveIndividualSelector';
import Breadcrumbs from '../../ui/Breadcrumbs';

const Navigation = () => {
    const { main: {active_individual, recent_individuals, workspace_breadcrumbs }, dispatch } = useContext(MainContext);

    const [open, setOpen] = useState(false);
    
    /* resize drag handle */ 
    const separator = useRef(null);

    /* resizable menu states */
    const [drag, setDrag] = useState(false);
    const [width, setWidth] = useState();

    /* list of classes based on template and currently selected class */
    const [ selected, setSelected ] = useState(null);
    const [ classes, setClasses ] = useState();

    /* load classes based on template */
    useEffect(() => {
        if(!classes) {
            // auto calling async arrow function
            (async () => {
                setClasses(await Repository.getNavigation());
            })();
        }
    }, [classes]);

    const classOnClick = useCallback((s) => {
        if(s === selected) {
            setSelected(null);
        }else{
            setSelected(s);
        }
    }, [selected, setSelected])

    const toggleNavigationOnClick = useCallback(() => {
        setOpen(!open);
    } , [ open, setOpen ]);

    const handleDrag = useCallback((state) => setDrag(state), [setDrag]);

    const handleMouseMove = useCallback((ev) => {
        if (drag) {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
            const partialWidth = ev.clientX;
            const widthPercentage = (100 * partialWidth) / vw;
            if(widthPercentage > 15){
                setWidth(widthPercentage);
            }else{
                setWidth(15);
            }
        }
    }, [drag, setWidth]);

    const switchIndividual = useCallback((uri) =>
        dispatch({ 
            type: 'switch-individual', 
            individual: { type:'uri', value: uri.props.value }  
        })
    , [dispatch]);

    return (
        <section className='flex'>
            <button className="toggle-navigation" onClick={toggleNavigationOnClick}></button>
            <section className={'navigation ' + (open ? 'open':'')}>
                <section className="main-menu" style={{ width: `${width}%` }}>
                    <section className="content">
                        <header>
                            <section className="close" onClick={toggleNavigationOnClick}></section>
                            <h2>List of classes</h2>
                        </header>
                        <menu>
                        { classes && classes.map(function({ s, count }, index){
                            return (
                                <Class
                                    key={index}
                                    s={s}
                                    count={count}
                                    selected={selected}
                                    classOnClick={classOnClick} 
                                />
                            )
                        })}
                        </menu>
                    </section>
                    <section className="resize-bar">
                        <section className="pannel-handle"></section>
                        <section 
                            className="handle"
                            ref={separator}
                            role="button"
                            tabIndex={0}
                            label="drag handle"
                            onMouseMove={(ev) => handleMouseMove(ev)}
                            onMouseDown={() => handleDrag(true)}
                            onMouseUp={() => handleDrag(false)}
                        >
                        </section>
                    </section>
                </section>
                
            </section>
            <ActiveIndividualSelector 
                active_individual={active_individual} 
                recent_individuals={recent_individuals} 
                switchIndividual={switchIndividual} 
            />
            <section className="workspace-navigation">
                <Breadcrumbs
                    min={2} 
                    crumbs={workspace_breadcrumbs.map((individual) => ({
                        label: <URI value={individual.value} applyPrefix={true} />,
                        value: individual.value
                    }))} 
                    onClick={(crumb, index) => {
                        dispatch({
                            type: 'workspace-focus-back',
                            crumb: {
                                index: index,
                                individual: {
                                    type: 'uri',
                                    value: crumb
                                }   
                            }
                        });
                    }}
                />
            </section>
        </section>
    )
}

export default Navigation