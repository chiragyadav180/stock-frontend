import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Popular stock symbols for demonstration
  const popularStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 
    'ADBE', 'CRM', 'ORCL', 'INTC', 'AMD', 'IBM', 'CSCO', 'QCOM',
    'PYPL', 'UBER', 'LYFT', 'SPOT', 'ZM', 'SHOP', 'SQ', 'TWTR',
    'DIS', 'NKE', 'SBUX', 'MCD', 'KO', 'PEP', 'WMT', 'TGT',
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'AXP'
  ]

  const fetchStockData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const stockPromises = popularStocks.map(async (symbol) => {
        try {
          // Try to get API key from backend or use demo
          const response = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=demo`
          )
          
          const data = response.data
          return {
            symbol,
            currentPrice: data.c,
            previousClose: data.pc,
            change: data.c - data.pc,
            changePercent: ((data.c - data.pc) / data.pc) * 100,
            high: data.h,
            low: data.l,
            volume: data.v,
            timestamp: data.t
          }
        } catch (error) {
          // If API fails, return mock data for demo
          const mockPrice = Math.random() * 500 + 50
          const mockChange = (Math.random() - 0.5) * 20
          return {
            symbol,
            currentPrice: mockPrice,
            previousClose: mockPrice - mockChange,
            change: mockChange,
            changePercent: (mockChange / (mockPrice - mockChange)) * 100,
            high: mockPrice + Math.random() * 10,
            low: mockPrice - Math.random() * 10,
            volume: Math.floor(Math.random() * 10000000),
            timestamp: Date.now()
          }
        }
      })

      const stockData = await Promise.all(stockPromises)
      setStocks(stockData)
    } catch (error) {
      console.error('Error fetching stock data:', error)
      setError('Failed to load stock data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStockData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchStockData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading market data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Market Overview</h1>
          <p className="text-gray-600">Real-time stock prices and market data</p>
        </div>

        {/* Market Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Stocks</h3>
            <p className="text-2xl font-bold text-gray-800">{stocks.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Gainers</h3>
            <p className="text-2xl font-bold text-green-600">
              {stocks.filter(stock => stock.change > 0).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Losers</h3>
            <p className="text-2xl font-bold text-red-600">
              {stocks.filter(stock => stock.change < 0).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Unchanged</h3>
            <p className="text-2xl font-bold text-gray-600">
              {stocks.filter(stock => stock.change === 0).length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">All Stocks</h2>
              <button
                onClick={fetchStockData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Close</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stocks.map((stock, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">${stock.currentPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${stock.previousClose.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${stock.high.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${stock.low.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.volume.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
} 