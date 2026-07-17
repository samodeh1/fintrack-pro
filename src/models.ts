export interface Transaction {
    _id?: string;
    id: string;
    title: string;
    amount: number;
    category: string;
    type: 'income' | 'expense'
    date: string;
}