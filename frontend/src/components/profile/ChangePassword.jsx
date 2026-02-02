import React, {useState} from 'react'
import {useAuthContext} from "../../hooks/useAuthContext";

const ChangePassword = ({onClose}) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const {user} = useAuthContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5555/users/${user.user.id}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.error || 'Failed to change password.');
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
                <div>
                    <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        placeholder='Current password'
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        placeholder='New password'
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        placeholder='Confirm new password'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
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