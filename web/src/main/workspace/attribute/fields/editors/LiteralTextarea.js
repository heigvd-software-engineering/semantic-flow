import React, { useEffect, useState } from 'react';

const LiteralTextarea = ({value, onChange: notifyField}) => {
    return (
        <textarea 
            autoFocus
            className="attribute-input literal-text" 
            cols={50}
            rows={10}
            onChange={(e) => notifyField(e.target.value) }
            value={value}
        />
    )
}

export default LiteralTextarea;