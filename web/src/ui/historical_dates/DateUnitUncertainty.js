import React from "react";


const DateUnitUncertainty = ({name, uncertainty, onChange}) => {
    return (
        <section className="uncertainty">
            <section className="uncertainty-label">+/-</section>
            <section className="uncertainty-value">
            <input 
                className="date-unit-input" 
                type="text" 
                onChange={(e) => onChange(name, e.target.value) }
                value={uncertainty} 
            /></section>
        </section>
    )
}

export default DateUnitUncertainty;