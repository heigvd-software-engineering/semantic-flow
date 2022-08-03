import React, { useEffect, useState } from 'react';

const LiteralText = ({value, onChange: notifyField}) => {
    return (
        <input 
            autoFocus
            data-testid="literal-text-input"
            className="attribute-input literal-text" 
            type="text" 
            onChange={(e) => notifyField(e.target.value) }
            value={value} 
        />
    )
}

export default LiteralText;