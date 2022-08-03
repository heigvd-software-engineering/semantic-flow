import React from "react";
import Tinybutton from '../../../ui/TinyButton';

const FieldToolbar = ({saveClick, cancelClick}) => {
    return (
        <section className='attribute-field-toolbar' data-testid="field-toolbar">
            <Tinybutton 
                title="Save this attribute"
                name="save-attribute"
                onClick={saveClick}
            />
            <Tinybutton 
                title="Cancel"
                name="cancel-attribute"
                onClick={cancelClick}
            />
        </section>
    )
}

export default FieldToolbar;