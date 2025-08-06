import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AppLayout } from "../components/layout/AppLayout";
import { Upload, Activity, CheckCircle, Clock, Server, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockFunctions = [
  { name: "image-processor", runtime: "Node.js", status: "success", lastRun: "2 hours ago" },
  { name: "data-validator", runtime: "Python", status: "running", lastRun: "5 minutes ago" },
  { name: "email-sender", runtime: "Node.js", status: "success", lastRun: "1 day ago" },
];

const stats = [
  { title: "Total Functions", value: "12", icon: Server, color: "text-primary" },
  { title: "Active Jobs", value: "3", icon: Activity, color: "text-accent" },
  { title: "Successful Runs", value: "156", icon: CheckCircle, color: "text-green-500" },
  { title: "Avg Response Time", value: "245ms", icon: Zap, color: "text-yellow-500" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Success</Badge>;
      case "running":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to FlexiFaaS
          </h1>
          <p className="text-xl text-primary font-medium mb-6">
            Effortless Serverless, Secure and Fast!
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Server className="h-5 w-5" />
            <span>Serverless Functions Made Simple</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/upload")}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant text-lg px-8 py-6 h-auto"
          >
            <Upload className="mr-3 h-5 w-5" />
            Upload New Function
          </Button>
          <Button
            onClick={() => navigate("/history")}
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 h-auto border-primary/20 hover:bg-primary/5"
          >
            <Clock className="mr-3 h-5 w-5" />
            View History
          </Button>
        </div>

        {/* Recent Functions */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Functions
            </CardTitle>
            <CardDescription>Your latest serverless function deployments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockFunctions.map((func, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-medium">
                      {func.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{func.name}</p>
                      <p className="text-sm text-muted-foreground">{func.runtime} • Last run {func.lastRun}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(func.status)}
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => navigate("/history")}>
                View All Functions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
