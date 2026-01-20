import React, { useState } from 'react'

const SIPCalculator = () => {
  const [principal, setPrincipal] = useState('')
  const [monthlyInvestment, setMonthlyInvestment] = useState('')
  const [annualReturn, setAnnualReturn] = useState('')
  const [years, setYears] = useState('')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const P = parseFloat(monthlyInvestment) || 0
    const r = (parseFloat(annualReturn) || 0) / 100 / 12
    const n = (parseFloat(years) || 0) * 12

    if (r === 0) {
      setResult(P * n)
    } else {
      const FV = P * (((1 + r) ** n - 1) / r) * (1 + r)
      setResult(FV)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">SIP Calculator</h3>
      <div className="space-y-3">
        <input type="number" placeholder="Monthly Investment (₹)" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Annual Return (%)" value={annualReturn} onChange={e => setAnnualReturn(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Years" value={years} onChange={e => setYears(e.target.value)} className="w-full p-2 border rounded" />
        <button onClick={calculate} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Calculate</button>
      </div>
      {result !== null && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-gray-700">Expected Amount</p>
          <p className="text-3xl font-bold text-blue-600">₹{result.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      )}
    </div>
  )
}

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState('')
  const [retirementAge, setRetirementAge] = useState('')
  const [currentSavings, setCurrentSavings] = useState('')
  const [annualExpenses, setAnnualExpenses] = useState('')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const age = parseFloat(currentAge) || 0
    const retAge = parseFloat(retirementAge) || 0
    const years = retAge - age
    const expenses = parseFloat(annualExpenses) || 0
    const needed = expenses * 25 // Rule of 25
    setResult({ needed, years })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Retirement Calculator</h3>
      <div className="space-y-3">
        <input type="number" placeholder="Current Age" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Retirement Age" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Annual Expenses (₹)" value={annualExpenses} onChange={e => setAnnualExpenses(e.target.value)} className="w-full p-2 border rounded" />
        <button onClick={calculate} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Calculate</button>
      </div>
      {result && (
        <div className="mt-4 p-4 bg-green-50 rounded space-y-2">
          <p className="text-gray-700">Years to Retirement: <span className="font-bold">{result.years}</span></p>
          <p className="text-gray-700">Corpus Needed (Rule of 25): <span className="font-bold text-green-600">₹{result.needed.toLocaleString()}</span></p>
        </div>
      )}
    </div>
  )
}

const LoanPayoffCalculator = () => {
  const [principal, setPrincipal] = useState('')
  const [annualRate, setAnnualRate] = useState('')
  const [years, setYears] = useState('')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const P = parseFloat(principal) || 0
    const r = (parseFloat(annualRate) || 0) / 100 / 12
    const n = (parseFloat(years) || 0) * 12

    if (r === 0) {
      setResult({ emi: P / n, totalAmount: P, totalInterest: 0 })
    } else {
      const emi = (P * r * (1 + r) ** n) / ((1 + r) ** n - 1)
      const totalAmount = emi * n
      const totalInterest = totalAmount - P
      setResult({ emi, totalAmount, totalInterest })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Loan Payoff Calculator</h3>
      <div className="space-y-3">
        <input type="number" placeholder="Loan Amount (₹)" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Annual Interest Rate (%)" value={annualRate} onChange={e => setAnnualRate(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Loan Period (Years)" value={years} onChange={e => setYears(e.target.value)} className="w-full p-2 border rounded" />
        <button onClick={calculate} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Calculate</button>
      </div>
      {result && (
        <div className="mt-4 p-4 bg-purple-50 rounded space-y-2">
          <p className="text-gray-700">Monthly EMI: <span className="font-bold text-purple-600">₹{result.emi.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></p>
          <p className="text-gray-700">Total Amount: <span className="font-bold">₹{result.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
          <p className="text-gray-700">Total Interest: <span className="font-bold text-red-600">₹{result.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
        </div>
      )}
    </div>
  )
}

export default function Calculators() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🧮 Financial Calculators</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SIPCalculator />
        <RetirementCalculator />
        <LoanPayoffCalculator />
      </div>
    </div>
  )
}
