import React, { useState, useEffect } from 'react';
import URI from '../../../../../common/URI';
const filterNonNumber = (value, callback) => {
    const newValue = value.replace(/[^0-9.,]/g, '');
    callback(newValue);
}

const LiteralNumber = ({value, datatype, onChange: notifyField}) => {
    return (
        <section className="flex">
            <input 
                autoFocus
                className="attribute-input literal-number" 
                type="text" 
                onChange={(e) => filterNonNumber(e.target.value, notifyField) }
                value={value} 
            />
            <URI value={datatype} applyPrefix={true} />
        </section>
    )
}

export default LiteralNumber;