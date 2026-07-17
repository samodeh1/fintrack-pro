import { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Trash2, LogOut, X } from 'lucide-react';
import type { Transaction } from './models';
import axios from 'axios';
import { Auth } from './Auth';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  // 1. State for our list of transactions
const [token, setToken] = useState<string | null>
 (localStorage.getItem('token'));
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);

// Form States
const [newTitle, setNewTitle] = useState('');
const [newAmount, setNewAmount] = useState('');
const [newType, setNewType] = useState<'income' | 'expense'>('expense');
const [newCategory, setNewCategory] = useState('Food');

  // --- 2. API FUNCTIONS ---
  // 1. Fetch from Database instead of LocalStorage
  const fetchTransactions = async (activeToken: string) => {
     try {
      const res = await axios.get('https://fintrack-api-812r.onrender.com/api/transactions', {
        headers: { 'x-auth-token': activeToken }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Fetch error: err");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Add to Database ( Add new to Backend)
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = { 
      title: newTitle, 
      amount: parseFloat(newAmount), 
      type: newType, 
      category: newCategory, 
      date: new Date().toISOString().split('T')[0] 
    };

      try {
        const res = await axios.post('https://fintrack-api-812r.onrender.com/api/transactions',
          newEntry, {
            headers: { 'x-auth-token': token }
          });
        setTransactions([res.data, ...transactions]); //Update UI with response from DB
        setIsModalOpen(false);
        setNewTitle('');
        setNewAmount('');
        toast.success("Transaction saved to cloud!");
      } catch (err) {
        toast.error("Failed to save transaction");
      }
    };

    // 3. Delete from Database
    const deleteTransanction = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this?')) {
        try {
          await axios.delete(`https://fintrack-api-812r.onrender.com/api/transactions/${id}`, {
            headers: { 'x-auth-token': token }
          });
          //  Filter out by both possible ID fields (MongoDB uses _id)
          setTransactions(transactions.filter(t => t._id !== id && t.id !== id));
          toast.success("Removed successfully")
        } catch (err) {
          toast.error("Failed to delete");
        }
      }
    };

   const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setTransactions([]);
    toast.success("Logged out");
   };

// --- DEFINE EFFECTS ---
 useEffect(() => {
  if (token) {
    localStorage.setItem('token', token);
    fetchTransactions(token)
  }
 }, [token]);

// --- CALCULATIONS ---
const income = transactions
  .filter(t => t.type === 'income')
  .reduce((acc, t) => acc + t.amount, 0);

const expenses = transactions
  .filter(t => t.type === 'expense')
  .reduce((acc, t) => acc + t.amount, 0);

const balance = income - expenses;

  // --- 5. PROTECTIVE GATE (LOGIN CHECK) ---
  if (!token) {
    return (
      <>
        <Toaster/>
        <Auth onLogin={(newToken) => setToken(newToken)} />
      </>
    );
  }

// --- MAIN DASHBOARD UI ---
return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Toaster />
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">FinTrack <span className="text-blue-600">Pro</span></h1>
          <button onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50
          px-4 py-2 rounded-lg transition font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
        
        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 uppercase font-bold mb-1">Total Balance</p>
                <h2 className="text-2xl font-bold">${balance.toLocaleString()}</h2>
              </div>
              <Wallet className="text-blue-500" />
            </div>
          </div> 

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Income</p>
                <h2 className="text-2xl font-bold text-green-600">+${income.toLocaleString()}</h2>
              </div>
              <TrendingUp className="text-green-500" />
            </div>
          </div>
            
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Expenses</p>
                <h2 className="text-2xl font-bold text-red-600">-${expenses.toLocaleString()}</h2>
              </div>
              <TrendingDown className="text-red-500" />
            </div>
          </div>
        </div>    
                
        {/* --- TRANSACTION LIST --- */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-gray-700 text-lg">Recent Transactions</h3>
            {/* THIS IS THE BUTTON THAT OPENS THE MODAL */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition
            shadow-lg shadow-blue-100">
              <PlusCircle size={20} /> Add Entry
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {isLoading ? (
              <p className="p-10 text-center text-gray-400">Loading your data...</p>
            ) : transactions.length === 0 ? (
              <p>No transactions found. Add your first one!</p>
            ) : (
              transactions.map(t => (
                <div key={t._id || t.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <p className="font-bold text-gray-800">{t.title}</p>
                    <p>{t.category} • {t.date}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="{`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}">
                      {t.type === 'income' ? '+' : '-'}${t.amount}
                    </span>
                    <button 
                      onClick={() => deleteTransanction(t._id || t.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
        </div>    
      </div>      
    </div>

      {/* --- ADD ENTRY MODAL (NOW INSIDE THE RETURN) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">New Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400
              hover:text-gray-600">
                <X />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                <input 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)} 
                  className="w-full p-3 bg-gray-50 border-none rounded-xl
                  focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Monthly Rent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount ($)</label>
                <input 
                  required
                  type="number"
                  value={newAmount} 
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl
                  focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-3 bg-gray-50  border-none rounded-xl
                    focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="income">Income (+)</option>
                    <option value="expense">Expense (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Salary">Salary</option>
                    <option value="Food">Food</option>
                    <option value="Rent">Rent</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>              

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700
                  shadow-lg shadow-blue-100 transition active:scale-95"
                >
                  Save Entry
                </button>
              </div>
            </form> 
          </div>
        </div>
      )}
    </div> // This closes the main min-h-screen div
  );
} // <--- ONLY ONE CLOSING BRACE FOR THE FUNCTION AT THE VERY END

export default App;
