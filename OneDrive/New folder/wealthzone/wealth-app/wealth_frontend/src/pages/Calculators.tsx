import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Calculator, Landmark, Home, ChevronLeft, ArrowRight } from 'lucide-react';

const Calculators = () => {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState(1000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(12);

  // Retirement Calculator State
  const [retirementAge, setRetirementAge] = useState(30);
  const [retirementGoalAge, setRetirementGoalAge] = useState(60);
  const [retirementMonthly, setRetirementMonthly] = useState(5000);
  const [retirementRate, setRetirementRate] = useState(8);

  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(300000);
  const [loanRate, setLoanRate] = useState(7);
  const [loanYears, setLoanYears] = useState(30);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // SIP Calculation
  const calculateSIP = () => {
    const monthlyRate = sipRate / 100 / 12;
    const months = sipYears * 12;
    const futureValue = sipMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = sipMonthly * months;
    const earnings = futureValue - totalInvested;
    return { futureValue, totalInvested, earnings };
  };

  // Retirement Calculation
  const calculateRetirement = () => {
    const years = retirementGoalAge - retirementAge;
    const monthlyRate = retirementRate / 100 / 12;
    const months = years * 12;
    const futureValue = retirementMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = retirementMonthly * months;
    const earnings = futureValue - totalInvested;
    return { futureValue, totalInvested, earnings, years };
  };

  // Loan Calculation
  const calculateLoan = () => {
    const monthlyRate = loanRate / 100 / 12;
    const months = loanYears * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;
    return { monthlyPayment, totalPayment, totalInterest };
  };

  const sipResults = calculateSIP();
  const retirementResults = calculateRetirement();
  const loanResults = calculateLoan();

  const renderCalculatorMenu = () => (
    <div className="grid gap-6 md:grid-cols-3 mt-8">
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 group" 
        onClick={() => setActiveCalculator('sip')}
      >
        <CardHeader>
          <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-6 w-6" />
          </div>
          <CardTitle>SIP Calculator</CardTitle>
          <CardDescription>Plan your systematic investments for long-term wealth creation.</CardDescription>
        </CardHeader>
        <CardFooter className="text-primary text-sm font-medium">
          Open Calculator <ArrowRight className="ml-2 h-4 w-4" />
        </CardFooter>
      </Card>

      <Card 
        className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 group" 
        onClick={() => setActiveCalculator('retirement')}
      >
        <CardHeader>
          <div className="h-12 w-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Landmark className="h-6 w-6" />
          </div>
          <CardTitle>Retirement Planner</CardTitle>
          <CardDescription>Calculate the corpus needed for a comfortable post-retirement life.</CardDescription>
        </CardHeader>
        <CardFooter className="text-primary text-sm font-medium">
          Open Planner <ArrowRight className="ml-2 h-4 w-4" />
        </CardFooter>
      </Card>

      <Card 
        className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 group" 
        onClick={() => activeCalculator !== 'loan' && setActiveCalculator('loan')}
      >
        <CardHeader>
          <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Home className="h-6 w-6" />
          </div>
          <CardTitle>EMI Calculator</CardTitle>
          <CardDescription>Check monthly installments for home loans, car loans, or personal loans.</CardDescription>
        </CardHeader>
        <CardFooter className="text-primary text-sm font-medium">
          Open Calculator <ArrowRight className="ml-2 h-4 w-4" />
        </CardFooter>
      </Card>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {activeCalculator && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveCalculator(null)}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {activeCalculator === 'sip' && 'SIP Calculator'}
              {activeCalculator === 'retirement' && 'Retirement Planner'}
              {activeCalculator === 'loan' && 'EMI Calculator'}
              {!activeCalculator && 'Financial Calculators'}
            </h1>
            <p className="text-muted-foreground">
              {!activeCalculator 
                ? 'Select a tool to plan your financial future' 
                : 'Adjust parameters to see your projected results'}
            </p>
          </div>
        </div>

        {!activeCalculator && renderCalculatorMenu()}

        {activeCalculator === 'sip' && (
            <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-accent" />
                    SIP Inputs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Monthly Investment</Label>
                      <span className="text-sm font-medium">{formatCurrency(sipMonthly)}</span>
                    </div>
                    <Slider
                      value={[sipMonthly]}
                      onValueChange={([value]) => setSipMonthly(value)}
                      min={100}
                      max={50000}
                      step={100}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Investment Period (Years)</Label>
                      <span className="text-sm font-medium">{sipYears} years</span>
                    </div>
                    <Slider
                      value={[sipYears]}
                      onValueChange={([value]) => setSipYears(value)}
                      min={1}
                      max={40}
                      step={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Expected Return Rate</Label>
                      <span className="text-sm font-medium">{sipRate}%</span>
                    </div>
                    <Slider
                      value={[sipRate]}
                      onValueChange={([value]) => setSipRate(value)}
                      min={1}
                      max={30}
                      step={0.5}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-blue-100">Projected Returns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-blue-400/30">
                      <span className="text-blue-100">Total Investment</span>
                      <span className="text-2xl font-bold">{formatCurrency(sipResults.totalInvested)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-blue-400/30">
                      <span className="text-blue-100">Estimated Returns</span>
                      <span className="text-2xl font-bold text-green-300">{formatCurrency(sipResults.earnings)}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-blue-200 text-sm uppercase tracking-wider block mb-1">Maturity Value</span>
                      <span className="text-4xl font-bold">{formatCurrency(sipResults.futureValue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}

        {activeCalculator === 'retirement' && (
            <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-accent" />
                    Retirement Inputs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Age</Label>
                      <Input 
                        type="number" 
                        value={retirementAge} 
                        onChange={(e) => setRetirementAge(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Retirement Age</Label>
                      <Input 
                        type="number" 
                        value={retirementGoalAge} 
                        onChange={(e) => setRetirementGoalAge(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Monthly Savings</Label>
                      <span className="text-sm font-medium">{formatCurrency(retirementMonthly)}</span>
                    </div>
                    <Slider
                      value={[retirementMonthly]}
                      onValueChange={([value]) => setRetirementMonthly(value)}
                      min={500}
                      max={20000}
                      step={100}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Expected Return Rate</Label>
                      <span className="text-sm font-medium">{retirementRate}%</span>
                    </div>
                    <Slider
                      value={[retirementRate]}
                      onValueChange={([value]) => setRetirementRate(value)}
                      min={1}
                      max={15}
                      step={0.5}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-emerald-800 text-white border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100">Retirement Projection</CardTitle>
                  <CardDescription className="text-green-200/70">
                    Growth over {retirementResults.years} years
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-green-400/30">
                      <span className="text-green-100">Total Contributions</span>
                      <span className="text-2xl font-bold">{formatCurrency(retirementResults.totalInvested)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-green-400/30">
                      <span className="text-green-100">Investment Growth</span>
                      <span className="text-2xl font-bold text-yellow-300">{formatCurrency(retirementResults.earnings)}</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-green-200 text-sm uppercase tracking-wider block mb-1">Projected Corpus</span>
                          <span className="text-4xl font-bold">{formatCurrency(retirementResults.futureValue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}

        {activeCalculator === 'loan' && (
            <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-accent" />
                    Loan Inputs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Loan Amount</Label>
                      <span className="text-sm font-medium">{formatCurrency(loanAmount)}</span>
                    </div>
                    <Slider
                      value={[loanAmount]}
                      onValueChange={([value]) => setLoanAmount(value)}
                      min={10000}
                      max={1000000}
                      step={10000}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Interest Rate</Label>
                      <span className="text-sm font-medium">{loanRate}%</span>
                    </div>
                    <Slider
                      value={[loanRate]}
                      onValueChange={([value]) => setLoanRate(value)}
                      min={1}
                      max={20}
                      step={0.25}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Loan Term</Label>
                      <span className="text-sm font-medium">{loanYears} years</span>
                    </div>
                    <Slider
                      value={[loanYears]}
                      onValueChange={([value]) => setLoanYears(value)}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-purple-100">Monthly EMI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                 <div className="text-center py-6 border-b border-purple-400/30">
                    <span className="text-6xl font-bold">{formatCurrency(loanResults.monthlyPayment)}</span>
                    <span className="text-purple-200 block mt-2">per month</span>
                 </div>
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-purple-100">Principal Amount</span>
                      <span className="text-xl font-bold">{formatCurrency(loanAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-purple-100">Total Interest</span>
                      <span className="text-xl font-bold text-red-200">{formatCurrency(loanResults.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-purple-400/30">
                      <span className="text-purple-100">Total Amount Payable</span>
                      <span className="text-2xl font-bold">{formatCurrency(loanResults.totalPayment)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Calculators;
