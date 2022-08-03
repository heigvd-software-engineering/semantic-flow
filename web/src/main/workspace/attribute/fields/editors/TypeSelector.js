import React, { useEffect, useState, useCallback } from "react";
import URI from "../../../../../common/URI";
import Config from "../../../../../config/config";
import Checkbox from "../../../../../ui/Checkbox";

const TypeSelector = ({states: initial, onChange: notifyField}) => {
    const [states, setStates] = useState(undefined);
    useEffect(() => {
        
        if(!states){
            let templateClasses = Config.getTemplateClasses();

            let selected = initial.filter(s => s.value.current).map((s) => ({
                ...s,
                label: <URI value={s.object.value} applyPrefix={true} />,
                disabled: !templateClasses.some((c) => c === s.object.value)
            }));

            let unselected =  templateClasses
            .filter((t) => !selected.some(s => s.object.value === t))
            .map((t) => ({
                value: {
                    current: false,
                    initial: false
                },
                object: {
                    type: 'uri',
                    value: t
                },
                label: <URI value={t} applyPrefix={true} />,
                disabled: false
            }));

            let initialStates = [
                ...selected,
                ...unselected
            ];

            setStates(initialStates);
            
        }
    }, [initial, states]);

    const onChange = useCallback((checked, index) => {
        let newStates = [...states];
        newStates[index].value.current = checked;
        setStates(newStates);
        notifyField(newStates);
        
    }, [states, setStates, notifyField]);


    return (
        <section className="types-selector">
            {
                states && states.map(({value: { current }, label, disabled}, index) => {
                    return (
                        <section key={index} className="type-selector-item">
                            <Checkbox 
                                name="type"
                                checked={current}
                                disabled={disabled}
                                label={label}
                                onChange={(checked) => onChange(checked, index)}
                            />
                        </section>
                    )
                })
            }
        </section>
    )
}

export default TypeSelector;