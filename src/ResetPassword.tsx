import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
    const { token } = useParams(); // Grabs the token from the URL
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) return toast.error("Passwords do not match");

        try {
            await axios.post(`https://fintrack-api-812r.onrender.com/api/auth/reset-password/${token}`, { password });
            toast.success("Password updated! Please login.");
            navigate('/'); // Send them back to the login page
        } catch (err) {
            toast.error("Link expired or invalid");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <h2 className="text-2xl font-bold mb-6">Create New Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        required
                        type="password"
                        placeholder="New Password" 
                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={e => setPassword(e.target.value)} 
                    />
                    <input 
                        required
                        type="password"
                        placeholder="Confirm Password" 
                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={e => setConfirmPassword(e.target.value)} 
                    />
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};