import React from "react";
import Selector from "./Selector";
import URI from "../../common/URI";

const Class = ({s, selected, count, classOnClick}) => {
    return (
        <li>
            <section className={'subject ' + (s && s.value === selected ? 'selected' : '') } onClick={() => classOnClick(s.value)}>
                <URI value={s.value} applyPrefix={true} />
                <section className="count">{ count.value }</section>
            </section>
            <Selector subject={s} selected={selected} />
        </li>
    )
}

export default Class;