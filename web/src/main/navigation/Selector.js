import React, { useState, useEffect, useCallback, useContext } from 'react';
import Repository from '../../core/dal/Repository';
import { MainContext } from '../../context/MainContext';
import SearchIndividuals from './SearchIndividuals';

const Selector = ({subject, selected}) => {
    const { dispatch, main: { recent_individuals }} = useContext(MainContext);
    const [ active, setActive ] = useState(false);
    
    useEffect(() => {
        setActive(subject && subject.value === selected);
    }, [subject, selected]);

    const searchFunction = useCallback((search, setResults) => {
        if(active && search.length < 3) {
            setResults([]);
            return;
        }
        active && search.length >= 3 && (async () => {
            setResults(await Repository.searchSubjectOfClass(subject.value, search));
        })();
    }, [subject, active]);  

    const clickResult = useCallback(({o}) => 
        recent_individuals.some(i => i.value === o.value) ? 
        dispatch({ type: 'switch-individual', individual: o })
    :
        dispatch({ type: 'open-individual', individual: o }) 
    , [dispatch, recent_individuals]);

    return (
        <section className={'selector ' + (subject && subject.value === selected ? 'selected' : '')}>
            <SearchIndividuals 
                click={clickResult} 
                search={searchFunction}
            />            
        </section>               
    )
}

export default Selector

/*

                <section className="results">
                    <h4>Recent subjects</h4>
                    <ul>
                        <li>&lt;http://stardog.com/tutorial/Young_Fyre&gt;</li>
                        <li>&lt;http://stardog.com/tutorial/88-Keys&gt;</li>
                    </ul>
                </section>

*/ 