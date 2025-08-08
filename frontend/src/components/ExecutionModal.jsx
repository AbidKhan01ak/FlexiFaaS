import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Play, Square, Clock, CheckCircle, XCircle, Copy } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { backendApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";

export function ExecutionModal({ isOpen, onClose, functionId, functionName }) {
  const [status, setStatus] = useState("idle"); // idle | queued | running | success | failed
  const [output, setOutput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [executionTime, setExecutionTime] = useState(0);
  const [inputPayload, setInputPayload] = useState(""); // User input for function
  const [logPolling, setLogPolling] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const { user } = useAuth();
  const { toast } = useToast();

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setOutput("");
      setErrorMsg("");
      setExecutionTime(0);
      setInputPayload("");
      setLogPolling(false);
      setStartTime(null);
    }
  }, [isOpen]);

  // Poll for execution logs after triggering execution
  useEffect(() => {
    let pollInterval;
    if (logPolling && functionId && user?.id) {
      pollInterval = setInterval(async () => {
        try {
          // Fetch latest log for this function and user
          const logs = await backendApi.get(`/api/logs/function/${functionId}`);
          // Filter logs for current user (optional: backend can do this)
          const userLogs = logs.filter((l) => l.userId === user.id);
          const latestLog = userLogs.sort(
            (a, b) => new Date(b.executionTime) - new Date(a.executionTime)
          )[0];
          if (latestLog) {
            setStatus(
              latestLog.status === "SUCCESS"
                ? "success"
                : latestLog.status === "FAILED"
                ? "failed"
                : latestLog.status?.toLowerCase() || "running"
            );
            setOutput(latestLog.output || "");
            setErrorMsg(latestLog.errorMessage || "");
            setExecutionTime(
              latestLog.executionTime
                ? (
                    (new Date(latestLog.executionTime) - new Date(startTime)) /
                    1000
                  ).toFixed(2)
                : 0
            );
            if (["SUCCESS", "FAILED", "ERROR"].includes(latestLog.status)) {
              setLogPolling(false);
              clearInterval(pollInterval);
              toast({
                title:
                  latestLog.status === "SUCCESS"
                    ? "Execution completed"
                    : "Execution failed",
                description:
                  latestLog.status === "SUCCESS"
                    ? "Function executed successfully"
                    : latestLog.errorMessage || "Execution failed",
                variant:
                  latestLog.status === "SUCCESS" ? "default" : "destructive",
              });
            }
          }
        } catch (e) {
          // You may display error toast here if needed
        }
      }, 1500);
    }
    return () => pollInterval && clearInterval(pollInterval);
    // eslint-disable-next-line
  }, [logPolling, functionId, user, startTime]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "queued":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Queued
          </Badge>
        );
      case "running":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Running
          </Badge>
        );
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Success
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "running":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const executeFunction = async () => {
    if (!functionId || !user?.id) return;
    setStatus("queued");
    setStartTime(new Date());
    setOutput("Function queued for execution...\n");
    setErrorMsg("");
    setExecutionTime(0);

    try {
      // Send execution request to backend
      await backendApi.post("/api/functions/execute", {
        functionId,
        userId: user.id,
        inputPayload,
      });
      setLogPolling(true);
      setStatus("running");
      toast({
        title: "Function execution queued",
        description: "Execution started. Polling for results...",
      });
    } catch (e) {
      setStatus("failed");
      setErrorMsg(e?.response?.data?.message || "Failed to queue execution");
      toast({
        title: "Execution failed",
        description: e?.response?.data?.message || "Could not start execution",
        variant: "destructive",
      });
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      description: "Execution output has been copied to your clipboard.",
    });
  };

  const stopExecution = () => {
    setLogPolling(false);
    setStatus("failed");
    setOutput((prev) => prev + "\nExecution stopped by user.");
    setErrorMsg("Execution stopped by user.");
    toast({
      title: "Execution stopped",
      description: "Function execution has been stopped.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Execute Function: {functionName}
          </DialogTitle>
          <DialogDescription>
            Run your serverless function and view execution logs in real time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-hidden">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  Execution Status
                </div>
                {getStatusBadge(status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Started</p>
                  <p className="font-medium">
                    {startTime ? startTime.toLocaleTimeString() : "Not started"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {executionTime > 0
                      ? `${executionTime}s`
                      : status === "running"
                      ? "Running..."
                      : "0s"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Error</p>
                  <p
                    className={`font-medium ${errorMsg ? "text-red-500" : ""}`}
                  >
                    {errorMsg || "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Payload */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Function Input (JSON or Args)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter function input payload (if needed)..."
                value={inputPayload}
                onChange={(e) => setInputPayload(e.target.value)}
                disabled={status === "running" || status === "queued"}
              />
            </CardContent>
          </Card>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={executeFunction}
              disabled={status === "running" || status === "queued"}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Play className="h-4 w-4 mr-2" />
              {status === "running"
                ? "Running..."
                : status === "queued"
                ? "Queued..."
                : "Execute Function"}
            </Button>

            {(status === "running" || status === "queued") && (
              <Button onClick={stopExecution} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}

            {output && (
              <Button
                onClick={copyOutput}
                variant="outline"
                className="ml-auto"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Output
              </Button>
            )}
          </div>

          {/* Output Section */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Execution Output</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px] w-full">
                <div className="p-4">
                  {output ? (
                    <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                      {output}
                    </pre>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                        <Play className="h-8 w-8" />
                      </div>
                      <p>
                        Click "Execute Function" to start execution and view
                        output logs
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
