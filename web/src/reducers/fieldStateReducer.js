export const fieldStateReducer = (state, action) => {
    switch(action.type){
        case 'init-selector-states': {
            return  {
                status: 'notified',
                states: action.states.map((o) => ({
                    object: o,
                    status: 'notified',
                    value: {
                        initial: true,
                        current: true
                    }
                }))};
        }
        case 'init-literal-states':
            return {
                status: 'notified',
                states: action.states.map((o) => ({
                    datatype: o.datatype ? o.datatype : action.datatype,
                    object: o,
                    value: {
                        initial: o.value,
                        current: o.value
                    }
                }))
            };
        case 'init-bnode-states':
            // we must deep copy the bnode data, bnode editor is updating its attributes by references
            return {
                fieldStatus: 'initial',
                bnodeStatus: action.states.length > 0 ? 'initial' : 'deleted',
                states: action.states.map((bnodeData) => ({
                    value: {
                        initial: JSON.parse(JSON.stringify(bnodeData)),
                        current: JSON.parse(JSON.stringify(bnodeData))
                    }
                }))
            };
        
        case 'add-literal-state': {
            let newStates = [...state.states];
            newStates.push(action.state);
            return {
                ...state,
                states: newStates
            };
        }

        case 'add-bnode-state': {
            return {
                ...state,
                states: [...state.states, {
                    value: {
                        initial: JSON.parse(JSON.stringify(action.state)),
                        current: JSON.parse(JSON.stringify(action.state))
                    }
                }]
            };
        }
            
        case 'literal-field-change':
            const newStates = [...state.states];
            newStates[action.index].value.current = action.value;
            return {
                states: newStates,
                status: 'changed'
            };
        case 'selector-field-change':
            return {
                states: action.states,
                status: 'changed'
            };
        case 'bnode-field-change': {
            // ! bnode editor component updates the attributes by their reference
            // so we only need to clone the object and update status
            return {
                states: [...state.states],
                ...action.status
            };
        }

        case 'set-notified':
            return {
                ...state,
                status: 'notified'
            }

            
        default:
            return state;
    }
}