import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { formatUploadTime } from "../lib/date";
import { api } from "../lib/api";
import { BACKEND_BASE } from "../lib/api";

import { Loader2, AlertCircle } from "lucide-react";

export function FunctionLogsModal({ isOpen, onClose, functionId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !functionId) return;
    setLoading(true);
    setError("");
    api
      .get(`${BACKEND_BASE}/api/logs/function/${functionId}`)
      .then(setLogs)
      .catch((e) => {
        setLogs([]);
        setError(
          e?.response?.data?.message || "Could not fetch execution logs."
        );
      })
      .finally(() => setLoading(false));
  }, [isOpen, functionId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Execution Logs</DialogTitle>
          <DialogDescription>
            View execution details for this function
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-6 text-muted-foreground text-center">
            No execution logs found for this function.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Output</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.status}</TableCell>
                  <TableCell>{formatUploadTime(log.executionTime)}</TableCell>
                  <TableCell>
                    <pre className="max-w-xs whitespace-pre-wrap">
                      {log.inputPayload}
                    </pre>
                  </TableCell>
                  <TableCell>
                    <pre className="max-w-xs whitespace-pre-wrap">
                      {log.output}
                    </pre>
                  </TableCell>
                  <TableCell>
                    {log.errorMessage ? (
                      <span className="text-destructive">
                        {log.errorMessage}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
