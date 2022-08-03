import React, {useState, useEffect } from "react";
import { displayHistoricalDate, getMinMaxDate } from './date_utils';

const UncertainAroundDateViewer = ({bnode}) => {

    const [date, setDate] = useState(undefined);
    const [summary, setSummary] = useState(undefined);

    useEffect(() => {
        if(date && !summary) {
            let minMax = getMinMaxDate(date.date, date.uncertainty);
            setSummary(minMax);
        }
    }, [date, summary]);

    useEffect(() => {
        if(!date && bnode.data.date){
            let newDate = bnode.data.date.object.split('.');
            let uncertainty = Object.fromEntries(Object.entries(bnode.data.uncertainty.data).map(([key, value]) => {
                return [key, parseInt(value.object)];
            }));

            setDate({
                date: {
                    year: newDate[0],
                    month: newDate[1],
                    day: newDate[2]
                },
                uncertainty: uncertainty
            })
        }
    }, [bnode, date, setDate]);

    return (
        <>
        {
            date && date.date && (
                <section className="historical-date-value">
                    <section className="summary">
                        {summary && (
                            <>
                            Somewhere between <b>{ `${displayHistoricalDate(summary.min)} `}</b> and <b>{`${displayHistoricalDate(summary.max)}`}</b>
                            </>
                        )}
                        
                    </section>
                </section>
            )

        }</>
    )
}

export default UncertainAroundDateViewer;