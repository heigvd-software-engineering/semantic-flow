import React, { useState, useEffect } from 'react';
import Config from '../config/config';
const URIInput = ({prefix:initialPrefix, placeholder, setValue, value}) => {
    
    const [ prefix, setPrefix ] = useState(initialPrefix);
    const [ open, setOpen ] = useState(false);

    useEffect(() => {
        if(prefix && prefix !== initialPrefix){
            if(setValue) {
                setValue(prefix, value);
            }
        }
    }, [prefix, setValue, value, initialPrefix]);

    return (
        <>
        <section className={`uri-input-container ${open ? 'open': ''}`}>
                <section className='uri-prefix' onClick={() => setOpen(!open)}><section className='arrow' />{prefix}:</section>
                <section className='uri-input-container'>
                    <input 
                        data-testid="uri-input"
                        className="uri-input"
                        type="text" 
                        placeholder={placeholder} 
                        spellCheck="false"
                        onChange={(ev) => {
                            setValue(prefix, ev.target.value);
                        } } 
                        value={value}
                        autoFocus
                    />
                </section>
        </section>
        <section className={`uri-input-prefix-selector ${open ? 'open': ''}`}>
                    {
                        Config.getPrefixes().map((prefix) => {
                            return (
                                <section className="prefix-option" key={prefix[0]} onClick={() => {
                                    setPrefix(prefix[0]);
                                    setOpen(false);
                                }
                                }>
                                    <section className='prefix-option-prefix'>{prefix[0]}:</section>
                                    <section className='prefix-option-value' title={prefix[1]}>{prefix[1]}</section>
                                </section>
                            )
                        })
                    }   
        </section>
        </>
    )
}

export default URIInput;