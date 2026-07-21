import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
            });

            console.log("Response:", response);

            const json = await response.json();

            if (!response.ok) {
                setIsLoading(false);
                setError(json.error);
            }

            if (response.ok) {
                // save the user to local storage
                localStorage.setItem('user', JSON.stringify(json));

                //save token
                localStorage.setItem('token', json.token)
                
                // update the auth context
                dispatch({ type: 'LOGIN', payload: json }); 

                setIsLoading(false);
                navigate("/dashboard/appointments", {replace: true});
            }
        } catch (error) {
            setError('Network error. Please try again later.');
            setIsLoading(false);
        }
    }
    
    return { login, isLoading, error };
}