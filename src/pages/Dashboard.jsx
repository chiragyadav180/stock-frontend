import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([])
  const [summary, setSummary] = useState({
    totalInvestedValue: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [tradingForm, setTradingForm] = useState({
    symbol: '',
    quantity: '',
    action: 'buy'
  })
  const [tradingLoading, setTradingLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)

  const token = localStorage.getItem('token')
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/portfolio/profile/summary`, config)
      setPortfolio(response.data.portfolio)
      setSummary(response.data.summary)
      setMessage(response.data.message || '')
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      setMessage('Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  // Handle stock trading (buy/sell)
  const handleTrade = async (e) => {
    e.preventDefault()
    const symbol = e.target.dataset.symbol || tradingForm.symbol
    const quantity = e.target.dataset.quantity || tradingForm.quantity
    const action = e.target.dataset.action || tradingForm.action

    if (!symbol || !quantity) {
      alert('Please fill in all fields')
      return
    }

    setTradingLoading(true)
    try {
      const endpoint = action === 'buy' 
        ? `${import.meta.env.VITE_BASE_URL}/api/portfolio/buy`
        : `${import.meta.env.VITE_BASE_URL}/api/portfolio/sell`

      await axios.post(endpoint, {
        symbol: symbol.toUpperCase(),
        quantity: parseInt(quantity)
      }, config)

      alert(`${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${symbol.toUpperCase()} successfully!`)
      
      // Reset form and refresh portfolio
      setTradingForm({ symbol: '', quantity: '', action: 'buy' })
      setSelectedStock(null)
      fetchPortfolio()
    } catch (error) {
      alert(error.response?.data?.msg || `${action === 'buy' ? 'Buy' : 'Sell'} failed`)
    } finally {
      setTradingLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Portfolio Dashboard</h1>
          <p className="text-gray-600">Manage your investments and track performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Invested</h3>
            <p className="text-2xl font-bold text-gray-800">${summary.totalInvestedValue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Value</h3>
            <p className="text-2xl font-bold text-gray-800">${summary.totalCurrentValue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total P&L</h3>
            <p className={`text-2xl font-bold ${summary.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.totalProfitLoss.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">P&L %</h3>
            <p className={`text-2xl font-bold ${summary.totalProfitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalProfitLossPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Section - Now shows selected stock details */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {selectedStock ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{selectedStock.symbol}</h2>
                    <button 
                      onClick={() => setSelectedStock(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{selectedStock.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Price:</span>
                      <span className="font-medium">${selectedStock.avgPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Price:</span>
                      <span className="font-medium">${selectedStock.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P&L:</span>
                      <span className={`font-medium ${selectedStock.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${selectedStock.profitLoss.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P&L %:</span>
                      <span className={`font-medium ${selectedStock.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedStock.profitLossPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleTrade}
                        data-action="buy"
                        data-symbol={selectedStock.symbol}
                        className={`flex-1 py-2 px-4 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        disabled={tradingLoading}
                      >
                        {tradingLoading ? 'Processing...' : 'Buy'}
                      </button>
                      <button
                        onClick={handleTrade}
                        data-action="sell"
                        data-symbol={selectedStock.symbol}
                        className={`flex-1 py-2 px-4 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        disabled={tradingLoading}
                      >
                        {tradingLoading ? 'Processing...' : 'Sell'}
                      </button>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        placeholder="Number of shares"
                        value={tradingForm.quantity}
                        onChange={(e) => setTradingForm({...tradingForm, quantity: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4">Quick Trade</h2>
                  <form onSubmit={handleTrade} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                      <select
                        value={tradingForm.action}
                        onChange={(e) => setTradingForm({...tradingForm, action: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Symbol</label>
                      <input
                        type="text"
                        placeholder="e.g., AAPL, GOOGL, MSFT"
                        value={tradingForm.symbol}
                        onChange={(e) => setTradingForm({...tradingForm, symbol: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        placeholder="Number of shares"
                        value={tradingForm.quantity}
                        onChange={(e) => setTradingForm({...tradingForm, quantity: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={tradingLoading}
                      className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                        tradingForm.action === 'buy' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    >
                      {tradingLoading ? 'Processing...' : `${tradingForm.action === 'buy' ? 'Buy' : 'Sell'} Stock`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Your Portfolio</h2>
              
              {message && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800">{message}</p>
                </div>
              )}

              {portfolio.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Your portfolio is empty</p>
                  <p className="text-sm text-gray-400">Start trading to see your stocks here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {portfolio.map((stock, index) => (
                        <tr 
                          key={index} 
                          className={`hover:bg-gray-50 cursor-pointer ${selectedStock?.symbol === stock.symbol ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedStock(stock)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stock.avgPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stock.currentPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${stock.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${stock.profitLoss.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${stock.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stock.profitLossPercentage.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchPortfolio}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Portfolio
          </button>
        </div>
      </div>
    </div>
  )
}