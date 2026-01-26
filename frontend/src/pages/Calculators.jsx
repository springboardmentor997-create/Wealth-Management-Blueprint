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
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 text-foreground bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">SIP Calculator</h3>
      <div className="space-y-3">
        <input type="number" placeholder="Monthly Investment (₹)" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <input type="number" placeholder="Annual Return (%)" value={annualReturn} onChange={e => setAnnualReturn(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <input type="number" placeholder="Years" value={years} onChange={e => setYears(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <button onClick={calculate} className="w-full btn-premium py-2 rounded text-white shadow-lg shadow-blue-500/20">Calculate</button>
      </div>
      {result !== null && (
        <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-muted-foreground text-sm uppercase font-semibold">Expected Amount</p>
          <p className="text-3xl font-bold text-blue-400">₹{result.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
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
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 text-foreground bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Retirement Calculator</h3>
      <div className="space-y-3">
        <input type="number" placeholder="Current Age" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <input type="number" placeholder="Retirement Age" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <input type="number" placeholder="Annual Expenses (₹)" value={annualExpenses} onChange={e => setAnnualExpenses(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <button onClick={calculate} className="w-full btn-premium py-2 rounded text-white shadow-lg shadow-green-500/20">Calculate</button>
      </div>
      {result && (
        <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20 space-y-2">
          <p className="text-muted-foreground text-sm">Years to Retirement: <span className="font-bold text-foreground">{result.years}</span></p>
          <p className="text-muted-foreground text-sm">Corpus Needed (Rule of 25): <span className="font-bold text-green-400 text-lg block mt-1">₹{result.needed.toLocaleString()}</span></p>
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
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 text-foreground bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Loan Payoff Calculator</h3>
      <div className="space-y-3">
        <input type="number" placeholder="Loan Amount (₹)" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <input type="number" placeholder="Annual Interest Rate (%)" value={annualRate} onChange={e => setAnnualRate(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <input type="number" placeholder="Loan Period (Years)" value={years} onChange={e => setYears(e.target.value)} className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-foreground focus:border-primary outline-none" />
        <button onClick={calculate} className="w-full btn-premium py-2 rounded text-white shadow-lg shadow-purple-500/20">Calculate</button>
      </div>
      {result && (
        <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 space-y-2 text-sm">
          <p className="text-muted-foreground">Monthly EMI: <span className="font-bold text-purple-400 text-lg block">₹{result.emi.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></p>
          <p className="text-muted-foreground">Total Amount: <span className="font-bold text-foreground">₹{result.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
          <p className="text-muted-foreground">Total Interest: <span className="font-bold text-red-400">₹{result.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
        </div>
      )}
    </div>
  )
}

export default function Calculators() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-foreground bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">🧮 Financial Calculators</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SIPCalculator />
        <RetirementCalculator />
        <LoanPayoffCalculator />
      </div>
    </div>
  )
}
