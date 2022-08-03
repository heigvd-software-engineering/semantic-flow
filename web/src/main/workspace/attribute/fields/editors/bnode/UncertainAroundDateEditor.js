import React, {useCallback, useEffect, useState} from "react";
import TinyButton from "../../../../../../ui/TinyButton";

import BnodeInput from "../../../../../../ui/BnodeInput";
import DateUnitUncertainty from "../../../../../../ui/historical_dates/DateUnitUncertainty";

const handleRelatedDateUnitStates = (name, value, newData) => {
    // handle the related date unit states, when month is not defined, day should be disabled etc...
    let disableFollowing = value === (name === 'year' ? "XXXX" : "XX");
    if(disableFollowing){
        let disableFollowingUnits = false;
        for(const dateUnit in newData.date){
            if(!disableFollowingUnits && dateUnit === name){
                disableFollowingUnits = true;
            }

            if(disableFollowingUnits){
                newData.date[dateUnit].value = dateUnit === 'year' ? "XXXX" : "XX";
                newData.date[dateUnit].show_extention = false;
                newData.uncertainty[dateUnit] = 0;
            }
        }
    }else{
        newData.date[name].show_extention = true;
    }
    return newData;
}

const nextStatus = (current) => {
    // decide the next bnode status based on current data
    let year = current.date.object.split(".")[0];
    if((year === 'XXXX' || year === '')){
        return 'deleted'; // delete condition
    }else{
        return 'updated';
    }
}

const UncertainAroundDate = ({bnode: {current}, index, onChange}) => {

    const [data, setData] = useState(undefined);

    useEffect(() => {
        
        if(current && data && data.status === 'changed'){
            // reacting on data changes to update bnode data based on local "data" status
            setData({
                ...data,
                status: 'initial' // preventing the infinite update loop
            })
            current.data.date.object = `${data.date.year.value}.${data.date.month.value}.${data.date.day.value}`;
            current.data.uncertainty.data.day.object = data.uncertainty.day;
            current.data.uncertainty.data.month.object = data.uncertainty.month;
            current.data.uncertainty.data.year.object = data.uncertainty.year;
            // notify the parent component with current data and the status about the field and bnode
            onChange(nextStatus(current.data));
        }

    }, [data, current, onChange, index])

    useEffect(() => {
        if(!data && current.data.date){
            // initialising local component data
            let date = current.data.date.object.split('.');
            let uncertainty = current.data.uncertainty.data;
            setData({
                status: 'initial',
                date: {
                    year: {
                        value: date[0],
                        show_extention: date[0] !== "XXXX"
                    },
                    month: {
                        value: date[1],
                        show_extention: date[1] !== "XX"
                    },
                    day: {
                        value: date[2],
                        show_extention: date[2] !== "XX"
                    }
                },
                uncertainty: {
                    year:  date[0] !== "XXXX" ? uncertainty.year.object : 0,
                    month: date[1] !== "XX"   ? uncertainty.month.object : 0,
                    day:   date[2] !== "XX"   ? uncertainty.day.object : 0
                }
            })
        }
    }, [current, data, setData]);

    const onDateUnitChange = useCallback((name, value) => {
        let newData = {
            ...data,
            status: 'changed',
            date: {
                ...data.date,
                [name]: {
                    ...data.date[name],
                    value: value
                }
            }
        };
        setData(handleRelatedDateUnitStates(name, value, newData));
    }, [data, setData]);

    const onUncertaintyChange = useCallback((name, value) => {
        if(value === "") value = 0;
        setData({
            ...data,
            status: 'changed',
            uncertainty: {
                ...data.uncertainty,
                [name]: value
            }
        });
    }, [data, setData]);

    return (
        <>
        {
            current && data && data.date && (
                <UncertainAroundDateInput 
                    date={data.date}
                    uncertainty={data.uncertainty}
                    onDateUnitChange={onDateUnitChange}
                    onUncertaintyChange={onUncertaintyChange}
                />
            )
        }</>
    )
}

const UncertainAroundDateInput = ({date, uncertainty, onDateUnitChange, onUncertaintyChange}) => {
    return (
        <section className="historical-date">
            <DateUnit
                name="year"
                label="YYYY"
                value={date.year.value}
                onChange={onDateUnitChange}
                onFocus={(ev) => {
                    if(ev.target.value === 'XXXX'){
                        onDateUnitChange('year', '');
                    }
                }}
                showExtention={date.year.show_extention}
                extention={
                    <DateUnitUncertainty
                        name="year"
                        uncertainty={uncertainty.year}
                        onChange={onUncertaintyChange}
                    />
                }
                action={date.year.value !== "XXXX" &&
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
                value={date.month.value}
                onChange={onDateUnitChange}
                onFocus={(ev) => {
                    if(ev.target.value === 'XX'){
                        onDateUnitChange('month', '');
                    }
                }}
                disabled={date.year.value === "XXXX"}
                showExtention={date.month.show_extention}
                extention={
                    <DateUnitUncertainty
                        name="month"
                        uncertainty={uncertainty.month}
                        onChange={onUncertaintyChange}
                    />
                }
                action={
                    date.month.value !== "XX" &&
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
                value={date.day.value}
                onChange={onDateUnitChange}
                onFocus={(ev) => {
                    if(ev.target.value === 'XX'){
                        onDateUnitChange('day', '');
                    }
                }}
                disabled={date.year.value === "XXXX" || date.month.value === "XX"}
                showExtention={date.day.show_extention}
                extention={
                    <DateUnitUncertainty
                        name="day"
                        uncertainty={uncertainty.day}
                        onChange={onUncertaintyChange}
                    />
                }
                action={
                    date.day.value !== "XX" &&
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

export default UncertainAroundDate;