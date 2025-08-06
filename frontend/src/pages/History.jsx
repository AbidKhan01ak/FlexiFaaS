import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { AppLayout } from "../components/layout/AppLayout";
import { Search, Calendar, Filter, Play, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";
import { ExecutionModal } from "../components/ExecutionModal";

const mockFunctions = [
  {
    id: "1",
    name: "image-processor",
    runtime: "Node.js 18",
    uploadDate: "2024-01-15",
    status: "success",
    lastExecution: "2 hours ago",
    executions: 45,
    size: "2.3 MB"
  },
  {
    id: "2",
    name: "data-validator",
    runtime: "Python 3.11",
    uploadDate: "2024-01-14",
    status: "running",
    lastExecution: "5 minutes ago",
    executions: 23,
    size: "1.8 MB"
  },
  {
    id: "3",
    name: "email-sender",
    runtime: "Node.js 20",
    uploadDate: "2024-01-12",
    status: "success",
    lastExecution: "1 day ago",
    executions: 67,
    size: "0.9 MB"
  },
  {
    id: "4",
    name: "pdf-generator",
    runtime: "Python 3.10",
    uploadDate: "2024-01-10",
    status: "failed",
    lastExecution: "3 hours ago",
    executions: 12,
    size: "3.1 MB"
  },
  {
    id: "5",
    name: "webhook-handler",
    runtime: "Go 1.19",
    uploadDate: "2024-01-08",
    status: "success",
    lastExecution: "30 minutes ago",
    executions: 156,
    size: "5.2 MB"
  },
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const { toast } = useToast();

  const filteredFunctions = mockFunctions.filter(func =>
    func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.runtime.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleExecute = (functionName) => {
    setSelectedFunction(functionName);
    setShowExecutionModal(true);
  };

  const handleDelete = (functionName) => {
    toast({
      title: "Function deleted",
      description: `Function "${functionName}" has been deleted successfully.`,
    });
  };

  const handleViewDetails = (functionName) => {
    toast({
      title: "Function details",
      description: `Viewing details for "${functionName}".`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Function History</h1>
            <p className="text-muted-foreground mt-2">Manage and monitor your deployed functions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Filter by Date
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Status
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search functions by name or runtime..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Functions Table */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>All Functions ({filteredFunctions.length})</CardTitle>
            <CardDescription>
              Your uploaded serverless functions and their execution history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Execution</TableHead>
                    <TableHead>Total Runs</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunctions.map((func) => (
                    <TableRow key={func.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-medium text-sm">
                            {func.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{func.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {func.runtime}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{func.uploadDate}</TableCell>
                      <TableCell>{getStatusBadge(func.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{func.lastExecution}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-medium">{func.executions}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{func.size}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(func.name)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExecute(func.name)}>
                              <Play className="h-4 w-4 mr-2" />
                              Execute
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(func.name)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredFunctions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No functions found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "Upload your first function to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution Modal */}
        <ExecutionModal 
          isOpen={showExecutionModal}
          onClose={() => setShowExecutionModal(false)}
          functionName={selectedFunction || ""}
        />
      </div>
    </AppLayout>
  );
}
