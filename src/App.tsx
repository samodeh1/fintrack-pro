import { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Trash2 } from 'lucide-react';
import type { Transaction } from './types';

function App() {
  // 1. State for our list of transactions
const [isModalOpen, setIsModalOpen] = useState(false);
const [newTitle, setNewTitle] = useState('');
const [newAmount, setNewAmount] = useState('');
const [newType, setNewType] = useState<'income' | 'expense'>('expense');
const [newCategory, setNewCategory] = useState<'Salary' | 'Food' | 'Rent' | 'Entertainment'>('Food');

const [transactions, setTransactions] = useState<Transaction[]>(() => {
  const saved = localStorage.getItem('fintrack_data');
  return saved ? JSON.parse(saved) : [
    {
      id: '1',
      title: 'Monthly Salary', 
      amount: 3000, 
      category: 'Salary', 
      type: 'income',     // MUST HAVE THIS
      date: '2024-03-01' // MUST HAVE THIS
    },
  
    {
      id: '2',
      title: 'Grocery Shopping',
      amount: 150,
      category: 'Food',
      type: 'expense',
      date: '2024-03-02'
    }
  ];   
}); 

// --- DEFINE EFFECTS ---
 useEffect(() => {
  localStorage.setItem('fintrack_data', JSON.stringify(transactions));
 }, [transactions]); // This runs every time 'transaction' changes

 // --- DEFINE FUNCTIONS ---
// 2. Logic: Calculate Totals

const handleAddTransaction = (e: React.FormEvent) => {
  e.preventDefault(); // Prevents the page from refreshing

  const newEntry: Transaction = {
    id: crypto.randomUUID(), // Generate a unique ID
    title: newTitle,
    amount: parseFloat(newAmount),
    type: newType,
    category: newCategory,
    date: new Date().toISOString().split('T')[0] // Get today's date
  };
  setTransactions([newEntry, ...transactions]); // Add the new item to the TOP of the list
  setIsModalOpen(false); // Close the modal
  setNewTitle(''); // Clears the form
  setNewAmount('');
};

const deleteTransaction = (id: string) => {
  if (window.confirm('Are you sure you want to delete this?')) {
    setTransactions(transactions.filter(t => t.id !== id));
  }
};

 // --- CALCULATIONS ---
const income = transactions
  .filter(t => t.type === 'income')
  .reduce((acc, t) => acc + t.amount, 0);

const expenses = transactions
  .filter(t => t.type === 'expense')
  .reduce((acc, t) => acc + t.amount, 0);
const balance = income - expenses;

return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">FinTrack Pro</h1>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase">Total Balance</p>
                <h2 className="text-2xl font-bold">${balance}</h2>
              </div>
              <Wallet className="text-blue-500" />
            </div>
          </div> 

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase">Income</p>
                <h2 className="text-2xl font-bold text-green-600">+${income}</h2>
              </div>
              <TrendingUp className="text-green-500" />
            </div>
          </div>
            
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase">Expenses</p>
                <h2 className="text-2xl font-bold text-red-600">-${expenses}</h2>
              </div>
              <TrendingDown className="text-red-500" />
            </div>
          </div>
        </div>    
                
        {/* --- TRANSACTION LIST --- */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Recent Transactions</h3>
            {/* THIS IS THE BUTTON THAT OPENS THE MODAL */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle size={20} /> Add Entry
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {transactions.map(t => (
              <div key={t.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">{t.title}</p>
                  <p className="text-sm text-gray-500">{t.category} • {t.date}</p>
                </div>
                <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600' }`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount}
                </span>

                <div className="flex items-center gap-4">
                <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount}
                </span>
                <button 
                  onClick={() => deleteTransaction(t.id)}
                  className="text-gray-300 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                </button>
              </div>
              </div>
            ))}

          </div>
        </div>
      </div> {/* This closes the max-w-4xl div */}

      {/* --- ADD ENTRY MODAL (NOW INSIDE THE RETURN) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Transaction</h2>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                  placeholder="e.g. Netflix Subscription"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <input 
                  required
                  type="number"
                  value={newAmount} 
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'income' | 'expense')}
                    className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                  >
                    <option value="income">Income (+)</option>
                    <option value="expense">Expense (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg mt-1"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
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
