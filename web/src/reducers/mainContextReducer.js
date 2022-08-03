
export const mainContextReducer = (state, action) => {
    switch (action.type) {
        case 'delete-active-individual':
            return {
                ...state,
                recent_individuals: state.recent_individuals.filter((individual) => individual.value !== state.active_individual.value),
                active_individual: {},
                active_location: {},
                workspace_breadcrumbs: []                
            };
        case 'delete-individual':
            return {
                ...state,
                recent_individuals: state.recent_individuals.filter((individual) => individual.value !== action.individual.value),
                workspace_breadcrumbs: state.workspace_breadcrumbs.filter((individual) => individual.value !== action.individual.value)
            };
        case 'update-individual':
            return { 
                ...state, 
                workspace_breadcrumbs: state.workspace_breadcrumbs.map((individual) => individual.value === action.individual.value ? action.individual : individual),
                recent_individuals: [...state.recent_individuals.filter((ind) => ind.value !== action.individual.old), action.individual],
                active_individual: action.individual,
                active_location: action.individual
        };
        case 'switch-individual':
            return { 
                ...state, 
                active_location: action.individual,
                active_individual: action.individual,
                workspace_breadcrumbs: [action.individual]
        };
        case 'open-individual':
            return { 
                ...state, 
                active_location: action.individual,
                active_individual: action.individual,
                recent_individuals: [...state.recent_individuals, action.individual],
                workspace_breadcrumbs: [action.individual]
        };
        case 'workspace-focus':
            if(state.workspace_breadcrumbs[state.workspace_breadcrumbs.length - 1].value === action.individual.value) {
                return state;
            }
            return { 
                ...state, 
                active_location: action.individual,
                workspace_breadcrumbs: [...state.workspace_breadcrumbs, action.individual]
        };
        case 'workspace-focus-back':
            return {
                ...state,
                active_location: action.crumb.individual,
                workspace_breadcrumbs: state.workspace_breadcrumbs.slice(0, action.crumb.index + 1)
        };
        case 'switch-view-mode':
            return {
                ...state,
                view_mode: action.view_mode
            };
        
        case 'dialog':
            return { ...state, dialog: { ...action.dialog } };
        default:
            return state;
    }
};
