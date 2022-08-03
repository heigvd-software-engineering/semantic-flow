import React from "react";

const Literal = ({value}) => {
    return (
        <section className="object literal" title={value}>
            {value}
        </section>
    )
}
    

export default Literal;