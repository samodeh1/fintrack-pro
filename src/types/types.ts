export interface Transaction {
    id: string;
    title: string;
    amount: number;
    category: 'Salary' | 'Food' | 'Rent' | 'Entertainment';
    type: 'income' | 'expense'
    date: string;
}