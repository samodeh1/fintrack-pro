import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

interface AuthProps {
    onLogin: (token: string) => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

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

     const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('https://fintrack-api-812r.onrender.com/api/auth/forgot-password', { email });
      toast.success("Check your email for the link!");
      setView('login');
    } catch (err: any) {
      toast.error("Email not found");
    }
  };

  if (view === 'forgot') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
        <form onSubmit={handleForgotPassword} className="space-y-4">
           <input 
             placeholder="Enter your email" 
             className="w-full p-3 border rounded-xl" 
             onChange={e => setEmail(e.target.value)} 
           />
           <p onClick={() => setView('forgot')} className="text-right text-xs text-blue-600 cursor-pointer">Forgot Password?</p>
           <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Send Link</button>
        </form>
        <button onClick={() => setView('login')} className="mt-4 text-blue-600 text-sm">Back to Login</button>
      </div>
    );
  }

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

                    <div className="my-6 flex items-center justify-center gap-2">
                    <hr className="w-full border-gray-300" />
                    <span className="text-gray-400 text-xs uppercase">OR</span>
                    <hr className="w-full border-gray-300" />
                    </div>

                    <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        try {
                        const res = await axios.post('http://localhost:5000/api/auth/google', {
                            token: credentialResponse.credential,
                        });
                        onLogin(res.data.token); // The backend will give us a fresh JWT
                        toast.success("Signed in with Google!");
                        } catch (err) {
                        toast.error("Google login failed");
                        }
                    }}
                    onError={() => toast.error("Login Failed")}
                    />
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4
                text-blue-600 text-sm">
                    {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </button>
            </div>
        </div>
    );
};