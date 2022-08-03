import React from "react";

import DropDown from "../../ui/DropDown";
import URI from "../../common/URI";

const ActiveIndividualSelector = ({ active_individual, recent_individuals, switchIndividual }) => {
    return (
        <section className="active-individual">
            {recent_individuals.length > 0 && <DropDown 
                onChange={switchIndividual} 
                options={recent_individuals.map((ind)=> <URI value={ind.value} applyPrefix={true} />)}
                selected={active_individual && <URI value={active_individual.value} applyPrefix={true} />}
            />}
        </section>
    )
}

export default ActiveIndividualSelector;