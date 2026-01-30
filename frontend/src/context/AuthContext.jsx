import { createContext, useReducer, useEffect } from "react";
import { isTokenValid } from "../utils/Auth";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
    switch(action.type) {
        case 'LOGIN':
            return {user: action.payload, authReady: true};
        case 'LOGOUT':
            return {user: null, authReady: true};
        case 'AUTH_READY':
            return {...state, authReady: true};
        default:
            return state;
    }
}

export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        authReady: false,
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if(!token || !isTokenValid(token)){
            dispatch({type: 'LOGOUT',})
            return;
        } else if(user){
            dispatch({type: 'LOGIN', payload: user })
        }

        dispatch({type: 'AUTH_READY' });
    }, [])

    console.log("AuthContext state:", state);

    return(
        <AuthContext.Provider value={{...state, dispatch}}>
            {children}
        </AuthContext.Provider>
    )
}