import React, {useState, useEffect} from 'react'
import {useAuthContext} from "../../hooks/useAuthContext";
import {Eye, EyeOff} from 'lucide-react'

const ChangePassword = ({onClose}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
    const {user} = useAuthContext();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { currentPassword, newPassword, confirmPassword } = formData;

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            };

            
            const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${user.user.id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });
            const json = await res.json();

            console.log(json.message);

            if (!res.ok) {
                setError(json.message || 'Failed to change password.');
            } else {
                onClose();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Change password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className='relative'>
                    <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        name='currentPassword'
                        value={formData.currentPassword}
                        placeholder='Current password'
                        onChange={handleChange}
                        className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button 
                            type='button'
                            onClick={() => setShowCurrentPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {showCurrentPassword ? <EyeOff/> : <Eye/>}
                        </button>
                </div>
                <div className='relative'>
                    <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name='newPassword'
                        value={formData.newPassword}
                        placeholder='New password'
                        onChange={handleChange}
                        className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button 
                            type='button'
                            onClick={() => setShowNewPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {showNewPassword ? <EyeOff/> : <Eye/>}
                        </button>
                </div>
                <div className='relative'>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        placeholder='Confirm new password'
                        onChange={handleChange}
                        className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                     <button 
                            type='button'
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {showConfirmPassword ? <EyeOff/> : <Eye/>}
                        </button>
                </div>
                {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Changing password...' : 'Change Password'}
                </button>
            </form>
        </div>
  )
}

export default ChangePassword