import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../types';
import { getCategories } from '../utils/storage';

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
  transactionToEdit?: Transaction | null;
  onCancelEdit?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onAddTransaction, 
  onUpdateTransaction, 
  transactionToEdit,
  onCancelEdit
}) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Transaction, 'id'>>();
  const [categories, setCategories] = useState<string[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Load categories from storage
  useEffect(() => {
    setCategories(getCategories());
  }, []);

  // Set form values when editing a transaction
  useEffect(() => {
    if (transactionToEdit) {
      setValue('type', transactionToEdit.type);
      setValue('date', transactionToEdit.date);
      setValue('amount', transactionToEdit.amount);
      setValue('category', transactionToEdit.category);
      setValue('payee', transactionToEdit.payee);
      setValue('reason', transactionToEdit.reason);
      setValue('description', transactionToEdit.description);
    }
  }, [transactionToEdit, setValue]);

  const onSubmit = (data: Omit<Transaction, 'id'>) => {
    // If using custom category, use that value instead
    const finalData = {
      ...data,
      category: showCustomCategory ? customCategory : data.category
    };

    if (transactionToEdit && onUpdateTransaction) {
      const updatedTransaction: Transaction = {
        ...finalData,
        id: transactionToEdit.id,
        amount: Number(finalData.amount),
      };
      onUpdateTransaction(updatedTransaction);
    } else {
      const transaction: Transaction = {
        ...finalData,
        id: uuidv4(),
        amount: Number(finalData.amount),
      };
      onAddTransaction(transaction);
    }
    
    setShowCustomCategory(false);
    setCustomCategory('');
    reset();
  };

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    reset();
    setShowCustomCategory(false);
    setCustomCategory('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Transaction Type</label>
            <select 
              className="w-full p-2 border rounded-md"
              {...register('type', { required: 'Type is required' })}
            >
              <option value="expense">Expense (Money Out)</option>
              <option value="income">Income (Money In)</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-md"
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Amount</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded-md"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' } 
              })}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Category</label>
            {!showCustomCategory ? (
              <div className="flex space-x-2">
                <select 
                  className="flex-grow p-2 border rounded-md"
                  {...register('category', { required: !showCustomCategory && 'Category is required' })}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
                  onClick={() => setShowCustomCategory(true)}
                >
                  Custom
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  className="flex-grow p-2 border rounded-md"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
                  onClick={() => setShowCustomCategory(false)}
                >
                  Choose Existing
                </button>
              </div>
            )}
            {errors.category && !showCustomCategory && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            {showCustomCategory && !customCategory && <p className="text-red-500 text-sm mt-1">Custom category is required</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Person Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              placeholder="Who paid/received money"
              {...register('payee', { required: 'Person name is required' })}
            />
            {errors.payee && <p className="text-red-500 text-sm mt-1">{errors.payee.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Reason</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              placeholder="Reason for transaction"
              {...register('reason', { required: 'Reason is required' })}
            />
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Description (Optional)</label>
          <textarea 
            className="w-full p-2 border rounded-md"
            rows={2}
            {...register('description')}
          />
        </div>

        <div className="flex gap-2">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex-grow"
            disabled={showCustomCategory && !customCategory}
          >
            {transactionToEdit ? 'Update Transaction' : 'Add Transaction'}
          </button>
          
          {transactionToEdit && (
            <button 
              type="button" 
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TransactionForm; 