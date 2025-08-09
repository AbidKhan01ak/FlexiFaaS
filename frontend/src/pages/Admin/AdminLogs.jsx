// src/pages/admin/AdminLogs.jsx
import { useEffect, useState, useMemo } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { backendApi, api } from "../../lib/api"; // api = middleware (8081), backendApi = backend (8080)
import { formatUploadTime } from "../../lib/date";
import { Badge } from "../../components/ui/badge";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [functionsMap, setFunctionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        // Load logs, users, and functions in parallel
        const [logsRes, usersRes, funcsRes] = await Promise.all([
          backendApi.get("/api/logs"),
          api.get("/api/users"),
          backendApi.get("/api/functions"),
        ]);

        // Create maps for quick lookup
        const userMap = {};
        (usersRes || []).forEach((u) => {
          userMap[u.id] = u.username;
        });

        const funcMap = {};
        (funcsRes || []).forEach((f) => {
          funcMap[f.id] = f.name;
        });

        setUsersMap(userMap);
        setFunctionsMap(funcMap);
        setLogs(Array.isArray(logsRes) ? logsRes : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load logs.");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
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

  // Sort newest first & map IDs to names
  const sortedLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(b.executionTime) - new Date(a.executionTime))
      .map((log) => ({
        ...log,
        username: usersMap[log.userId] || `User #${log.userId}`,
        functionName:
          functionsMap[log.functionId] || `Function #${log.functionId}`,
      }));
  }, [logs, usersMap, functionsMap]);

  return (
    <AppLayout>
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>All Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading...
            </div>
          ) : err ? (
            <div className="py-6 text-center text-destructive">{err}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Function</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Executed</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLogs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.id}</TableCell>
                      <TableCell>{l.username}</TableCell>
                      <TableCell>{l.functionName}</TableCell>
                      <TableCell>{getStatusBadge(l.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatUploadTime(l.executionTime)}
                      </TableCell>
                      <TableCell className="max-w-[320px]">
                        <pre className="whitespace-pre-wrap text-xs">
                          {l.output || "-"}
                        </pre>
                      </TableCell>
                      <TableCell className="max-w-[320px]">
                        <pre className="whitespace-pre-wrap text-xs text-destructive">
                          {l.errorMessage || "-"}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedLogs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
