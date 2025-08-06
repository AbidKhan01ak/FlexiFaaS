import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Play, Square, Clock, CheckCircle, XCircle, Copy } from "lucide-react";
import { useToast } from "../hooks/use-toast";

// Mock Output & Error
const mockOutput = `Function executed successfully!

Input received:
{
  "message": "Hello, FlexiFaaS!",
  "timestamp": "2024-01-15T10:30:00Z"
}

Processing...
✓ Validation passed
✓ Data processed
✓ Response generated

Output:
{
  "result": "Function completed successfully",
  "processedAt": "2024-01-15T10:30:02Z",
  "executionTime": "2.3s",
  "status": "success"
}

Memory usage: 128MB / 256MB
CPU usage: 45%
Execution time: 2.34 seconds`;

const mockError = `Error executing function!

Input received:
{
  "message": "Test error case",
  "timestamp": "2024-01-15T10:30:00Z"
}

Processing...
✓ Validation passed
✗ Runtime error occurred

Error Details:
TypeError: Cannot read property 'undefined' of null
    at processData (/var/task/index.js:23:15)
    at handler (/var/task/index.js:45:12)
    at Runtime.handleOnce (/var/runtime/Runtime.js:66:25)

Stack trace:
  Line 23: const result = data.invalid.property;
  Line 45: return processData(event.body);

Memory usage: 64MB / 256MB
CPU usage: 12%
Execution time: 0.89 seconds`;

export function ExecutionModal({ isOpen, onClose, functionName }) {
  const [status, setStatus] = useState("idle");
  const [output, setOutput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [executionTime, setExecutionTime] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setOutput("");
      setStartTime(null);
      setExecutionTime(0);
    }
  }, [isOpen]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "queued":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Queued</Badge>;
      case "running":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Running</Badge>;
      case "success":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Success</Badge>;
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

  const executeFunction = () => {
    setStatus("queued");
    setStartTime(new Date());
    setOutput("Function queued for execution...\n");

    setTimeout(() => {
      setStatus("running");
      setOutput(prev => prev + "Function is now running...\n");
    }, 1000);

    setTimeout(() => {
      // Randomly succeed or fail for demo
      const shouldFail = Math.random() < 0.3;
      setStatus(shouldFail ? "failed" : "success");
      setOutput(shouldFail ? mockError : mockOutput);
      setExecutionTime(shouldFail ? 0.89 : 2.34);
      
      toast({
        title: shouldFail ? "Execution failed" : "Execution completed",
        description: shouldFail 
          ? "Function execution failed with errors" 
          : "Function executed successfully",
        variant: shouldFail ? "destructive" : "default",
      });
    }, 3000);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      description: "Execution output has been copied to your clipboard.",
    });
  };

  const stopExecution = () => {
    if (status === "running" || status === "queued") {
      setStatus("failed");
      setOutput(prev => prev + "\nExecution stopped by user.");
      toast({
        title: "Execution stopped",
        description: "Function execution has been stopped.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Execute Function: {functionName}
          </DialogTitle>
          <DialogDescription>
            Run your serverless function and view real-time execution logs
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
                    {executionTime > 0 ? `${executionTime}s` : status === "running" ? "Running..." : "0s"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Memory Usage</p>
                  <p className="font-medium">
                    {status === "success" ? "128MB / 256MB" : status === "failed" ? "64MB / 256MB" : "N/A"}
                  </p>
                </div>
              </div>
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
              {status === "running" ? "Running..." : status === "queued" ? "Queued..." : "Execute Function"}
            </Button>
            
            {(status === "running" || status === "queued") && (
              <Button
                onClick={stopExecution}
                variant="destructive"
              >
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
                      <p>Click "Execute Function" to start execution and view output logs</p>
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
