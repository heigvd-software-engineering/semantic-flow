import React, {useCallback, useEffect, useState} from "react";
import TinyButton from "../../../../../../ui/TinyButton";
import BnodeInput from "../../../../../../ui/BnodeInput";
import bnodeTemplates from '../../../../../../config/bnodes.json';

const TemplateMeta = bnodeTemplates['uncertain-possibilities-date'].meta;

const nextStatus = (current) => {
    // decide the next bnode status based on current data
    let year = current.best_guess ? current.best_guess.object.split(".")[0] : 'XXXX';
    if((year === 'XXXX' || year === '') && current.possibility.object.length === 0){
        return 'deleted';
    }else{
        return 'updated';
    }
}

const UncertainPossibilitiesDate = ({bnode: {current}, index, onChange}) => {

    const [data, setData] = useState(undefined);

    useEffect(() => {
        if(!data){
            // initialising local component data
            let best_guess = "XXXX.XX.XX";
            if(current.data.best_guess && current.data.best_guess.object){
                best_guess = current.data.best_guess.object;
            }
            let possibility = [];
            if(current.data.possibility && current.data.possibility.object){
                possibility = Array.isArray(current.data.possibility.object) ? current.data.possibility.object : [current.data.possibility.object];
            }
            if(possibility.length === 0){
                possibility = [TemplateMeta.possibility_template.object];
            }
            setData({
                status: 'initial',
                best_guess,
                possibility: possibility.map(p => ({
                    possibility: p,
                    is_best_guess: p === best_guess
                }))
            })
        }
    }, [current, data, setData]);

    useEffect(() => {
        if(data && data.status === 'changed'){
            // reacting on data changes to update bnode data based on local "data" status
            setData({
                ...data,
                status: 'initial' // preventing the infinite update loop
            })
            if(data.best_guess === 'XXXX.XX.XX' || data.best_guess === ''){
                delete current.data.best_guess;
            }else{
                if(!current.data.best_guess || !current.data.best_guess.object){
                    // reconstituer l'attribut manquant
                    current.data.best_guess = {...TemplateMeta.best_guess_template};
                }
                current.data.best_guess.object = data.best_guess;
            }
            // transforming single object to multivalued 
            if(!current.data.possibility || !current.data.possibility.object){
                current.data.possibility = {...TemplateMeta.possibility_template};
            }

            let possibility = data.possibility
            .filter(p => p.possibility !== 'XXXX.XX.XX' && p.possibility !== '.XX.XX')
            .map(p => p.possibility);

            //Store new possibilities into the bnode
            current.data.possibility.object = [
                // use Set to remove duplicates
                ...new Set(possibility)
            ];

            // remove best guess in case no existing possibility is matching it
            const best_guess_exists = possibility.some(p => p === data.best_guess);
            if(!best_guess_exists && current.data.best_guess){
                delete current.data.best_guess;
            }
           
            // notify the parent component with current data and the status about the field and bnode
            onChange(nextStatus(current.data));
        }

    }, [data, current, onChange, index])

    const onDateInputChange = useCallback((index, newDate) => {
        // update local data
        const newPossbilities = [...data.possibility];
        newPossbilities[index].possibility = newDate;
        let best_guess = data.best_guess;
        if(newPossbilities[index].is_best_guess){
            best_guess = newDate;
        }
        setData({
            ...data,
            status: 'changed',
            best_guess,
            possibility: newPossbilities
        });
    }, [data, setData]);

    const clickAddNewPossibility = useCallback(() => {
        // add new possibility to local data
        setData({
            ...data,
            status: 'changed',
            possibility: [...data.possibility, {
                possibility: TemplateMeta.possibility_template.object,
                is_best_guess: false
            }],
        });
    }, [data, setData]);

    const clickBestGuess = useCallback((possibility) => {
        // update local data
        setData({
            ...data,
            status: 'changed',
            best_guess: possibility !== data.best_guess ? possibility : "XXXX.XX.XX",
            possibility: [...data.possibility].map(p => ({
                ...p,
                is_best_guess: p.possibility === possibility ? !p.is_best_guess : false
            }))
        });
    }, [data, setData]);

    return (
        <>
        {
            current && data && data.possibility && data.possibility.length && data.possibility.map(({possibility, is_best_guess}, index) => (
                <section className={`possibility ${is_best_guess ? 'selected': ''}`} key={index}>
                    <UncertainPossibilitiesDateInput 
                        key={index}
                        index={index}
                        possibility={possibility}
                        is_best_guess={is_best_guess}
                        onDateInputChange={onDateInputChange}
                    />
                    <section className="possibility-select-best-guess" onClick={() => clickBestGuess(possibility)}>
                        Best Guess
                    </section>
                </section>
            ))
            
        }
        <section className="bnode-actions">
            <section className="insert-button" onClick={clickAddNewPossibility}><section className="plus">+</section></section>
        </section>   
        </>
    )
}

const UncertainPossibilitiesDateInput = ({possibility:initial, is_best_guess, index, onDateInputChange}) => {
    const [date, setDate] = useState(undefined);
    
    useEffect(() => {
        if(!date && initial){
            let date = initial.split('.');
            setDate({
                status: 'initial',
                year:   date[0],
                month:  date[1],
                day:    date[2]
            })
        }
    }, [initial, date, setDate]);

    useEffect(() => {
        if(date && date.status === 'changed'){
            // reacting on data changes to update bnode data based on local "data" status
            setDate({
                ...date,
                status: 'initial' // preventing the infinite update loop
            })
            onDateInputChange(index, `${date.year}.${date.month}.${date.day}`);
        }
    }, [date, index, onDateInputChange]);

    const onDateUnitChange = useCallback((name, value) => {
        let newDate = {
            ...date,
            status: 'changed',
            [name]: value
        }
        if(value.includes("XX")){
            let properties = ['year', 'month', 'day'];
            let nameIndex = properties.indexOf(name);
            for(const property of properties.slice(nameIndex + 1)){
                newDate[property] = 'XX';
            }
        }
        
        setDate(newDate);
    }, [date, setDate]);
    return (
        date && <section className="historical-date">
            <DateUnit
                name="year"
                label="YYYY"
                value={date.year}
                onChange={onDateUnitChange}
                onFocus={(ev) => {
                    if(ev.target.value === 'XXXX'){
                        onDateUnitChange('year', '');
                    }
                }}
                action={date.year !== "XXXX" &&
                    (<TinyButton 
                        title="Clear this unit"
                        name="clear-date-unit"
                        onClick={() => {
                            onDateUnitChange('year', 'XXXX');
                        }}
                    />)
                }
            />
            <DateUnit
                name="month"
                label="MM"
                value={date.month}
                onChange={onDateUnitChange}
                onFocus={(ev) => {
                    if(ev.target.value === 'XX'){
                        onDateUnitChange('month', '');
                    }
                }}
                disabled={date.year === "XXXX"} 
                action={
                    date.month !== "XX" &&
                    (
                        <TinyButton 
                            title="Clear this unit"
                            name="clear-date-unit"
                            onClick={() => {
                                onDateUnitChange('month', 'XX');
                            }}
                        />
                    )
                }
            />
            <BnodeInput
                name="day"
                label="DD"
                value={date.day}
                onChange={onDateUnitChange}
                onFocus={(ev) => {
                    if(ev.target.value === 'XX'){
                        onDateUnitChange('day', '');
                    }
                }}
                disabled={date.year === "XXXX" || date.month === "XX"}
                action={
                    date.day !== "XX" &&
                    (
                        <TinyButton 
                            title="Clear this unit"
                            name="clear-date-unit"
                            onClick={() => {
                                onDateUnitChange('day', 'XX');
                            }}
                        />
                    )
                }
            />
        </section>
    )
}

const DateUnit = ({name, label, value, onChange, onFocus, showExtention, extention, action}) => {
    return (
        <BnodeInput
            name={name}
            label={label}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            showExtention={showExtention}
            extention={extention}
            action={action}
        />
    )
}

export default UncertainPossibilitiesDate;