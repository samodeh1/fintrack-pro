import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AuthProps {
    onLogin: (token: string) => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = isLogin ? 'login' : 'register';
        try {
            const res = await axios.post(`https://fintrack-api-812r.onrender.com/api/auth/${endpoint}`, {
                email, password, username
            });
            if (isLogin) {
                onLogin(res.data.token);
                toast.success("Welcome back!");
            } else {
                setIsLogin(true);
                toast.success("Register! Please login.");
            }
            
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <h2 className="text-3xl font-bold text-center mb-8">{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input placeholder="Username" className="w-full p-3 border rounded-xl"
                        onChange={e => setUsername(e.target.value)} />
                    )}
                    <input placeholder="Email" type="email" className="w-full p-3 border rounded-xl"
                    onChange={e => setEmail(e.target.value)} />
                    <input placeholder="Password" type="password" className="w-full p-3 border rounded-xl"
                    onChange={e => setPassword(e.target.value)} />
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4
                text-blue-600 text-sm">
                    {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </button>
            </div>
        </div>
    );
};