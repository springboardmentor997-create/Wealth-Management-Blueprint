import React, { useState, useEffect } from 'react'
import apiClient from '../api/client'

export default function RiskAssessmentQuiz({ onComplete }) {
  const [step, setStep] = useState('intro') // intro, quiz, result
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Load quiz questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await apiClient.get('/assessment/risk-tolerance/info')
        setQuestions(response.data.questions)
      } catch (err) {
        setError('Failed to load assessment')
        console.error(err)
      }
    }
    loadQuestions()
  }, [])

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [`question${questionId}`]: value
    }))
  }

  const handleSubmit = async () => {
    // Validate all questions answered
    if (Object.keys(answers).length < 5) {
      setError('Please answer all questions')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.post('/assessment/risk-tolerance', answers)
      setResult(response.data)
      setStep('result')
    } catch (err) {
      setError(err.response?.data?.detail || 'Assessment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Intro Step */}
      {step === 'intro' && (
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-3xl font-bold mb-4">Risk Tolerance Assessment</h2>
          <p className="text-gray-700 mb-6">
            This quiz helps us understand your investment preferences and risk appetite. 
            Your answers will help tailor recommendations specifically for you.
          </p>
          
          <div className="bg-blue-50 p-4 rounded mb-6 border-l-4 border-blue-500">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              <li>5 questions about your investment preferences</li>
              <li>Rate each question on a scale of 1-5</li>
              <li>Takes about 2-3 minutes</li>
              <li>Results are used to personalize your investment strategy</li>
            </ul>
          </div>

          <button
            onClick={() => setStep('quiz')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded"
          >
            Start Assessment
          </button>
        </div>
      )}

      {/* Quiz Step */}
      {step === 'quiz' && (
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Risk Tolerance Assessment</h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((Object.keys(answers).length) / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{Object.keys(answers).length} of 5 answered</p>
          </div>

          {error && <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">{error}</div>}

          {/* Questions */}
          <div className="space-y-8">
            {questions.map((q) => (
              <div key={q.id} className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-semibold text-lg mb-4">{q.id}. {q.question}</h3>
                
                <div className="space-y-2">
                  {q.options.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border rounded hover:bg-blue-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question${q.id}`}
                        value={option.value}
                        checked={answers[`question${q.id}`] === option.value}
                        onChange={() => handleAnswer(q.id, option.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 flex-1">{option.label}</span>
                      <span className="text-xs text-gray-500">({option.value}/5)</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep('intro')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || Object.keys(answers).length < 5}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded"
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && result && (
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Your Risk Profile</h2>
            <div className="inline-block">
              <div className={`text-5xl font-bold py-4 px-8 rounded-lg ${
                result.risk_profile === 'conservative' ? 'bg-green-100 text-green-800' :
                result.risk_profile === 'moderate' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {result.risk_profile.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded mb-6">
            <h3 className="font-semibold mb-2">Your Score: {result.score}/5.0</h3>
            <p className="text-gray-700 mb-4">{result.recommendation}</p>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  result.risk_profile === 'conservative' ? 'bg-green-500' :
                  result.risk_profile === 'moderate' ? 'bg-blue-500' :
                  'bg-orange-500'
                }`}
                style={{ width: `${(result.score / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500 mb-6">
            <h3 className="font-semibold mb-2">What this means:</h3>
            <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
              {result.risk_profile === 'conservative' && (
                <>
                  <li>Focus on capital preservation and steady, predictable growth</li>
                  <li>Suggested allocation: 60% bonds, 30% stocks, 10% cash</li>
                  <li>Regular rebalancing to maintain stability</li>
                </>
              )}
              {result.risk_profile === 'moderate' && (
                <>
                  <li>Balance between growth and stability</li>
                  <li>Suggested allocation: 50% stocks, 40% bonds, 10% alternatives</li>
                  <li>Diversified across sectors and asset classes</li>
                </>
              )}
              {result.risk_profile === 'aggressive' && (
                <>
                  <li>Focus on long-term capital appreciation</li>
                  <li>Suggested allocation: 80% stocks, 15% alternatives, 5% bonds</li>
                  <li>Embrace market volatility for higher returns</li>
                </>
              )}
            </ul>
          </div>

          <button
            onClick={() => onComplete && onComplete(result)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded"
          >
            Continue to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
