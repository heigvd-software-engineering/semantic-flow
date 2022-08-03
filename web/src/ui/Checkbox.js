import React, { useState } from "react";

const Checkbox = ({name, label, checked, disabled, onChange}) => {
    return (
        <section 
            data-testid="checkbox"
            className={`checkbox ${checked ? 'checked': ''} ${disabled ? 'disabled': ''}`}
            onClick={() => !disabled && onChange(!checked)}
            >
            <section className="square"></section>
            <label>{label}</label>
        </section>
    )
}

export default Checkbox;