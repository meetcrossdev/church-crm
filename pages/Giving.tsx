import React, { useState } from 'react';
import { Plus, Download, DollarSign } from 'lucide-react';
import { storage } from '../services/storageService';
import { Donation, FundType, Member } from '../types';

export const Giving: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>(storage.getDonations());
  const [members] = useState<Member[]>(storage.getMembers());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalGiving = donations.reduce((sum, d) => sum + d.amount, 0);

  const getMemberName = (id?: string) => {
    if (!id) return 'Anonymous';
    const m = members.find(m => m.id === id);
    return m ? `${m.firstName} ${m.lastName}` : 'Unknown';
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDonation: Donation = {
      id: '',
      memberId: formData.get('memberId') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      fund: formData.get('fund') as FundType,
      method: formData.get('method') as any,
    };
    storage.addDonation(newDonation);
    setDonations(storage.getDonations());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Giving</h1>
          <p className="text-slate-500">Track tithes, offerings, and donations</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
              <Download size={20} className="mr-2" />
              Export CSV
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus size={20} className="mr-2" />
              Record Giving
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mr-4">
                <DollarSign size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Total Giving (YTD)</p>
                <p className="text-2xl font-bold text-slate-900">${totalGiving.toLocaleString()}</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Donor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fund</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Method</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {donations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((donation) => (
              <tr key={donation.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-900">
                    {new Date(donation.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {getMemberName(donation.memberId)}
                </td>
                <td className="px-6 py-4">
                   <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                     {donation.fund}
                   </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                    {donation.method}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">
                    ${donation.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* Add Giving Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Record New Donation</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Donor</label>
                  <select name="memberId" className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    <option value="">Anonymous</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                        <input required name="amount" type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fund</label>
                        <select name="fund" className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                            {Object.values(FundType).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                        <select name="method" className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                            <option value="Cash">Cash</option>
                            <option value="Transfer">Transfer</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
