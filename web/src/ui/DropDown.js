import React, { useState, useCallback, useEffect } from "react";

const DropDown = ({onChange, options, selected}) => {
    const [open, setOpen] = useState(false);

    const [display, setDisplay] = useState(selected);

    useEffect(() => selected && setDisplay(selected), [selected, setDisplay])

    const optionOnClick = useCallback((opt) => {
        if(onChange){
           onChange(opt);
        }
        setDisplay(opt);
        setOpen(false)
    }, [onChange]);
    
    return (
        <section className={'dropdown ' + (open ? ' open' : '')}>
            <section className="dropdown-container" onClick={() => setOpen(!open)}>
                <section className="dropdown-display">{display}</section>
                <section className="dropdown-arrow">
                    <section className="arrow"></section>
                </section>
            </section>
            <section className="dropdown-content">
                <section className="dialog-arrow"></section>
                {options && options.map((option, index) => (
                    <section key={index} className="dropdown-option" onClick={() => optionOnClick(option)}>{option}</section>
                ))}
            </section>
        </section>
    )
}   

export default DropDown