import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { AppLayout } from "../components/layout/AppLayout";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { api } from "../lib/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await api.get("/api/users/me");
        setProfile(data);
      } catch (err) {
        toast({
          title: "Failed to load profile",
          description: err?.response?.data?.message || "Error fetching user info",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-destructive">Failed to load profile.</span>
        </div>
      </AppLayout>
    );
  }

  const functionsUploaded = 12;    // Replace with real data if available
  const totalExecutions = 156;
  const successRate = "99.2%";

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "N/A";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-2 shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {profile.username}
                  </h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                      {profile.role || "User"}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      {profile.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={profile.username}
                    readOnly
                    className="pl-10 bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="pl-10 bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.role || "User"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{joinDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
              <CardDescription>Your activity overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">{functionsUploaded}</div>
                <div className="text-sm text-muted-foreground">Functions Uploaded</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-accent-foreground">{totalExecutions}</div>
                <div className="text-sm text-muted-foreground">Total Executions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{successRate}</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full sm:w-auto" disabled>
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
