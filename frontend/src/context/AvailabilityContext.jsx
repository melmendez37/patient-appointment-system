import { createContext, useReducer } from "react";

export const AvailabilitiesContext = createContext();

export const availabilityReducer = (state, action) => {
    switch(action.type){
        case "SET_AVAILABILITIES":
            return {
                availabilities: action.payload
            }
        case "CREATE_AVAILABILITIES":
            return {
                availabilities: [action.payload, ...state.availabilities]
            }
        // case "DELETE_APPOINTMENTS":
        //     return {

        //     }
        default:
            return state
    }
}

export const AvailabilitiesContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(availabilityReducer, {
        availabilities: []
    })

    return (
        <AvailabilitiesContext.Provider value={{...state, dispatch}}>
            { children }
        </AvailabilitiesContext.Provider>
    )
}