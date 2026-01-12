import { AvailabilitiesContext } from "../context/AvailabilityContext";
import { useContext } from "react";

export const useAvailabilityContext = () => {
    const context = useContext(AvailabilitiesContext);

    if(!context){
        throw Error('useAvailabilityContext must be used inside an AvailabilitiesContextProvider')
    }

    return context
}