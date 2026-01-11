
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import { Lightbulb, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expected_impact: string;
  action_link?: string;
}

interface RebalanceRec {
  asset_class: string;
  current_percentage: number;
  target_percentage: number;
  action: string;
}

const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [rebalanceRecs, setRebalanceRecs] = useState<RebalanceRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recsRes, rebalanceRes] = await Promise.all([
          apiClient.getRecommendations(),
          apiClient.getRebalanceRecommendations()
        ]);
        
        if (recsRes.data) setRecommendations(recsRes.data);
        if (rebalanceRes.data) setRebalanceRecs(rebalanceRes.data);
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleApplyAll = () => {
    // Navigate to transaction page to let user execute trades
    navigate('/portfolio');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">Personalized insights to optimize your portfolio</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Strategic Recommendations */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Strategic Insights
            </h2>
            {recommendations.map((rec) => (
              <Card key={rec.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expected Impact:</span>
                    <span className="font-medium text-green-600">{rec.expected_impact}</span>
                  </div>
                </CardContent>
                {rec.action_link && (
                    <CardFooter className="pt-0">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-2"
                            onClick={() => navigate(rec.action_link!)}
                        >
                            Take Action <ArrowRight className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                )}
              </Card>
            ))}
            {recommendations.length === 0 && (
                 <div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted/20">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No actionable insights needed. You're doing great!</p>
                 </div>
            )}
          </div>

          {/* Rebalancing */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Portfolio Rebalancing
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Asset Allocation Alignment</CardTitle>
                <CardDescription>Suggestions to match your risk profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rebalanceRecs.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{rec.asset_class}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Current: {rec.current_percentage}%</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>Target: {rec.target_percentage}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{rec.action}</p>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4" variant="outline" onClick={handleApplyAll}>
                  Apply All Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Recommendations;
