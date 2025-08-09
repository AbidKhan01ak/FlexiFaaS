import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { AppLayout } from "../components/layout/AppLayout";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";
import {
  Search,
  PowerOff,
  Power,
  Play,
  Trash2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";
import { ExecutionModal } from "../components/ExecutionModal";
import { FunctionLogsModal } from "../components/FunctionLogsModal";
import { useAuth } from "../context/AuthContext";
import { backendApi } from "../lib/api";
import { formatUploadTime } from "../lib/date";

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [showExecutionModal, setShowExecutionModal] = useState(false);

  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedFunctionId, setSelectedFunctionId] = useState(null);

  // delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // status dialog
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchFunctions() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await backendApi.get(`/api/functions/user/${user.id}`);
        data.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
        setFunctions(data);
      } catch (err) {
        setFunctions([]);
        toast({
          title: "Error loading functions",
          description:
            err?.response?.data?.message || "Could not fetch function history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchFunctions();
    // eslint-disable-next-line
  }, [user?.id]);

  const filteredFunctions = functions.filter(
    (func) =>
      func.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.runtime?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge className="!bg-blue-100 !text-blue-700 !hover:bg-blue-100 border border-blue-300">
            ACTIVE
          </Badge>
        );
      case "dead":
        return (
          <Badge className="!bg-gray-800 !text-white-700 !hover:bg-gray-100 border border-gray-300">
            DEAD
          </Badge>
        );
      case "success":
        return (
          <Badge className="!bg-green-100 !text-green-700 !hover:bg-green-100 border border-green-300">
            Success
          </Badge>
        );
      case "error":
        return (
          <Badge className="!bg-orange-100 !text-orange-700 !hover:bg-orange-100 border border-orange-300">
            Error
          </Badge>
        );

      case "failed":
        return (
          <Badge className="!bg-red-100 !text-red-700 !hover:bg-red-100 border border-red-300">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExecute = (func) => {
    setSelectedFunction(func);
    setShowExecutionModal(true);
  };

  const handleViewDetails = (functionId) => {
    setSelectedFunctionId(functionId);
    setShowLogsModal(true);
  };
  const askDelete = (func) => {
    setDeleteTarget({ id: func.id, name: func.name });
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await backendApi.delete(`/api/functions/${deleteTarget.id}`);
      setFunctions((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast({
        title: "Function deleted",
        description: `Function "${deleteTarget.name}" has been removed.`,
      });
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err?.response?.data?.message || "Could not delete the function.",
        variant: "destructive",
      });
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // —— Status toggle helpers ——
  const askToggleStatus = (func) => {
    const current = (func.status || "").toUpperCase();
    const nextStatus = current === "ACTIVE" ? "DEAD" : "ACTIVE";
    setStatusTarget({ id: func.id, name: func.name, nextStatus });
    setStatusOpen(true);
  };

  const persistStatus = async (id, status) => {
    // Placeholder: try a PUT to existing endpoint with full DTO if you add support.
    try {
      const res = await backendApi.patch(`/api/functions/${id}/status`, {
        status,
      });

      // Optional: update local state immediately if backend returns updated function
      if (res && res.id) {
        setFunctions((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: res.status } : f))
        );
      }

      toast({
        title: "Status updated",
        description: `Function status set to "${status}".`,
      });
    } catch (err) {
      toast({
        title: "Failed to update status",
        description:
          err?.response?.data?.message ||
          "An error occurred while updating status.",
        variant: "destructive",
      });
    }
  };

  const confirmToggleStatus = async () => {
    if (!statusTarget?.id) return;
    const { id, name, nextStatus } = statusTarget;

    // Optimistic UI update
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: nextStatus } : f))
    );

    // Try to persist (won’t work until backend exists)
    await persistStatus(id, nextStatus);

    toast({
      title: `Marked as ${nextStatus}`,
    });

    setStatusOpen(false);
    setStatusTarget(null);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="text-muted-foreground">
            Loading function history...
          </span>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Function History
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor your deployed functions
            </p>
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
                            <p className="font-medium text-foreground">
                              {func.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {func.runtime}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatUploadTime(func.uploadTime)}
                      </TableCell>
                      <TableCell>{getStatusBadge(func.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(func.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExecute(func)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Execute
                            </DropdownMenuItem>
                            {/* Toggle status */}
                            {(func.status || "").toUpperCase() === "ACTIVE" ? (
                              <DropdownMenuItem
                                onClick={() => askToggleStatus(func)}
                              >
                                <PowerOff className="h-4 w-4 mr-2" />
                                Mark as Dead
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => askToggleStatus(func)}
                              >
                                <Power className="h-4 w-4 mr-2" />
                                Mark as Active
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => askDelete(func)}
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
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No functions found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Upload your first function to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution Modal */}
        <ExecutionModal
          isOpen={showExecutionModal}
          onClose={() => setShowExecutionModal(false)}
          functionId={selectedFunction?.id}
          functionName={selectedFunction?.name || ""}
        />
        <FunctionLogsModal
          isOpen={showLogsModal}
          onClose={() => setShowLogsModal(false)}
          functionId={selectedFunctionId}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete function?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                <span className="font-medium">
                  {deleteTarget?.name || "this function"}
                </span>{" "}
                and remove its file from the server (if implemented).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={confirmDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Status Confirmation */}
        <AlertDialog open={statusOpen} onOpenChange={setStatusOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change function status?</AlertDialogTitle>
              <AlertDialogDescription>
                Set{" "}
                <span className="font-medium">
                  {statusTarget?.name || "this function"}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {statusTarget?.nextStatus}
                </span>
                .{/* eslint-disable-next-line */}
                <br />
                This updates the UI immediately. Add a backend endpoint to
                persist.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmToggleStatus}>
                Apply
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
