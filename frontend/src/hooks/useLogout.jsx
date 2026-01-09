import { useAuthContext } from "./useAuthContext";

export const logout = () => {
    const { dispatch } = useAuthContext();

    const logout = () => {
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    }

    return { logout };
}