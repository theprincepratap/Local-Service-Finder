import { useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiDownload, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EarningsSection = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Mock data
  const earningsData = {
    totalEarnings: 45250,
    thisMonth: 12500,
    pending: 3200,
    withdrawn: 42050,
    availableBalance: 3200,
  };

  const transactions = [
    { id: 1, date: '2025-10-15', type: 'earning', description: 'Plumbing Service - Raj Kumar', amount: 1000, status: 'completed' },
    { id: 2, date: '2025-10-14', type: 'earning', description: 'Electrical Repair - Sita Patel', amount: 900, status: 'completed' },
    { id: 3, date: '2025-10-13', type: 'withdrawal', description: 'Bank Transfer - HDFC ***1234', amount: -5000, status: 'completed' },
    { id: 4, date: '2025-10-12', type: 'earning', description: 'Carpentry - Priya Singh', amount: 1500, status: 'completed' },
    { id: 5, date: '2025-10-10', type: 'earning', description: 'Painting - Neha Gupta', amount: 3200, status: 'pending' },
    { id: 6, date: '2025-10-09', type: 'earning', description: 'AC Repair - Amit Shah', amount: 1800, status: 'completed' },
  ];

  const monthlyData = [
    { month: 'Apr', amount: 8200 },
    { month: 'May', amount: 9500 },
    { month: 'Jun', amount: 7800 },
    { month: 'Jul', amount: 11200 },
    { month: 'Aug', amount: 10500 },
    { month: 'Sep', amount: 9800 },
    { month: 'Oct', amount: 12500 },
  ];

  const handleWithdraw = () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > earningsData.availableBalance) {
      toast.error('Insufficient balance');
      return;
    }
    toast.success(`Withdrawal request of ₹${withdrawAmount} submitted!`);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings & Payments</h2>
          <p className="text-gray-600 mt-1">Track your income and manage withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiCreditCard />
          Withdraw Funds
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-700">Total Earnings</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                ₹{earningsData.totalEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <FiTrendingUp size={14} />
                +12% from last month
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <FiDollarSign className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div>
            <p className="text-sm text-blue-700">This Month</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              ₹{earningsData.thisMonth.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600 mt-2">Across 15 jobs</p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div>
            <p className="text-sm text-yellow-700">Available Balance</p>
            <p className="text-3xl font-bold text-yellow-900 mt-2">
              ₹{earningsData.availableBalance.toLocaleString()}
            </p>
            <p className="text-sm text-yellow-600 mt-2">Ready to withdraw</p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div>
            <p className="text-sm text-purple-700">Total Withdrawn</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">
              ₹{earningsData.withdrawn.toLocaleString()}
            </p>
            <p className="text-sm text-purple-600 mt-2">Lifetime</p>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-3">
          {monthlyData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full">
                <div
                  className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t hover:from-primary-700 hover:to-primary-500 transition-colors cursor-pointer"
                  style={{ height: `${(data.amount / 12500) * 200}px` }}
                  title={`₹${data.amount}`}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    ₹{(data.amount / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
            <FiDownload size={16} />
            Download Statement
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'earning'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {transaction.type === 'earning' ? (
                    <FiTrendingUp size={20} />
                  ) : (
                    <FiCreditCard size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <FiCalendar size={14} />
                      {transaction.date}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
              <p
                className={`text-lg font-bold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Available Balance</p>
                <p className="text-3xl font-bold text-primary-600">
                  ₹{earningsData.availableBalance.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input w-full"
                  max={earningsData.availableBalance}
                />
                <div className="flex gap-2 mt-2">
                  {[1000, 2000, 3000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setWithdrawAmount(amount.toString())}
                      className="btn btn-outline btn-sm flex-1"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Funds will be transferred to your registered bank account
                  within 2-3 business days.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleWithdraw}
                  className="btn btn-primary flex-1"
                >
                  Confirm Withdrawal
                </button>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                  }}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsSection;
