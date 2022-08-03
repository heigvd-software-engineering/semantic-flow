import React, {useState} from 'react';
import URIInput from './URIInput';
import Config from '../config/config';

const URIForm = ({ value, setValue, clickCancel, clickSave, clickDelete }) => {
    return (
        <>
            <URIInput
                prefix={value.prefix}
                value={value.input}
                setValue={(pref, value) => {
                    setValue({
                      prefix: pref,
                      input: value,
                      uri: Config.getUri(pref, value)
                    });
                  }}
            />
            <section className='form-toolbar'>
                <section>
                    {clickSave && <button className='button' onClick={clickSave}>Save</button>}
                    {clickCancel && <button className='button orange'  onClick={clickCancel}>Cancel</button>}
                </section>
                {clickDelete && <button className='button red' onClick={clickDelete}>Delete</button>}
            </section>
        </>
    )
}

export default URIForm;