import React, {useState, useEffect } from "react";
import { displayHistoricalDate } from './date_utils';

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

const UncertainPossibilitiesDateViewer = ({bnode}) => {

    const [data, setData] = useState(undefined);

    useEffect(() => {
        if(!data){
            let best_guess = ['XXXX', 'XX', 'XX']; 
            if(bnode.data.best_guess && bnode.data.best_guess.object){
                best_guess = bnode.data.best_guess.object.split(".");
            }

            let BnodePossibility = []
            if(bnode.data.possibility && bnode.data.possibility.object){
                BnodePossibility = Array.isArray(bnode.data.possibility.object) ? bnode.data.possibility.object : [bnode.data.possibility.object];
            }
            
            setData({
                best_guess: {
                    year:   best_guess[0],
                    month:  best_guess[1],
                    day:    best_guess[2]
                },
                possibility: BnodePossibility
                .filter(p => p !== best_guess.join("."))
                .map((possibility) => {
                    let possibilityDate = possibility.split('.');
                    return {
                        year: possibilityDate[0],
                        month: possibilityDate[1],
                        day: possibilityDate[2]
                    }
                })      
            })
        }
    }, [bnode, data, setData]);

    return (
        <>
        {
            data && data.best_guess && data.possibility && (
                <>
                    <section className="summary">
                        {data.best_guess.year !== 'XXXX' && (
                            <section className="best_guess">
                                <span className="label">Best Guess:</span>      
                                <span className="value"><b>{displayHistoricalDate(data.best_guess)}</b></span>
                                
                            </section>
                        )}
                        {data.possibility.length > 0 && (
                            <section className="possibilities">
                                <span className="label">Could {data.best_guess.year !== 'XXXX' ? 'also' : ''} be any of following possibilities:</span>
                                {data.possibility.map((possibility, index) => (
                                    <section className="possibility" key={index}>
                                        <b>{displayHistoricalDate(possibility)}</b>
                                    </section>
                                ))}
                            </section>
                        )}
                    </section>
                </>
            )
        }</>
    )
}

export default UncertainPossibilitiesDateViewer;