import React from "react";

const BnodeInput = ({name, label, placeholder, value, onChange, onFocus, disabled, showExtention, extention, action}) => {
    return (
        <section className={`bnode-input ${name} ${disabled ? 'disabled': ''}`}>
            <section className="label"><span>{label}</span></section> 
            <section className="value">
            {
                (!disabled && (
                    <input 
                        autoFocus={name==='year'}
                        onFocus={onFocus}
                        placeholder={placeholder}
                        className={`bnode-unit-input ${name}`} 
                        type="text" 
                        onChange={(e) => onChange(name, e.target.value) }
                        value={value} 
                    /> 
                )) ||
                (disabled && value)
            }
            
            </section>
            {showExtention && extention}
            {action && (
                <section className="action">{action}</section>
            )}
        </section>
    )
}

export default BnodeInput;