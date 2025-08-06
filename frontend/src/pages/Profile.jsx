import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { AppLayout } from "../components/layout/AppLayout";
import { User, Mail, Shield, Calendar, Edit2, Save, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const userProfile = {
  username: "johndoe",
  email: "john.doe@example.com",
  role: "Developer",
  status: "Active",
  joinDate: "January 2024",
  functionsUploaded: 12,
  totalExecutions: 156,
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: userProfile.username,
    email: userProfile.email,
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: userProfile.username,
      email: userProfile.email,
    });
    setIsEditing(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-2 shadow-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{userProfile.username}</h3>
                  <p className="text-muted-foreground">{userProfile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                      {userProfile.role}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      {userProfile.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userProfile.role}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userProfile.joinDate}</span>
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
                <div className="text-2xl font-bold text-primary">{userProfile.functionsUploaded}</div>
                <div className="text-sm text-muted-foreground">Functions Uploaded</div>
              </div>
              
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-accent-foreground">{userProfile.totalExecutions}</div>
                <div className="text-sm text-muted-foreground">Total Executions</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">99.2%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full sm:w-auto">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
