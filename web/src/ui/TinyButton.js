import React from "react";

const Tinybutton = ({title, name, onClick}) => {
    return(
        <section 
            data-testid={`tinybutton-${name}`}
            title={title}
            className={`tiny-button ${name}`}
            onClick={onClick}
            >
        </section>
    )
}

export default Tinybutton;