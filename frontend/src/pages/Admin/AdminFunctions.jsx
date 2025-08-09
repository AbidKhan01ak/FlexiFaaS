// src/pages/admin/AdminFunctions.jsx
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
import { Badge } from "../../components/ui/badge";
import { backendApi, api } from "../../lib/api"; // api = middleware (8081), backendApi = backend (8080)
import { formatUploadTime } from "../../lib/date";

export default function AdminFunctions() {
  const [functions, setFunctions] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // { [id]: { id, username, ... } }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        // Fetch all functions (backend) and all users (middleware) in parallel
        const [funcs, users] = await Promise.all([
          backendApi.get("/api/functions"),
          api.get("/api/users"),
        ]);

        setFunctions(Array.isArray(funcs) ? funcs : []);
        const map = {};
        (Array.isArray(users) ? users : []).forEach((u) => {
          map[u.id] = u; // keep whole object; we'll display u.username
        });
        setUsersMap(map);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load functions/users.");
        setFunctions([]);
        setUsersMap({});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 hover:bg-green-100"
          >
            Success
          </Badge>
        );
      case "running":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-100"
          >
            Running
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  // If backend someday returns ownerName directly, prefer that; otherwise map ownerId->username
  const rows = useMemo(() => {
    return (functions || []).map((f) => {
      const ownerNameFromMap = usersMap[f.ownerId]?.username;
      const owner =
        f.ownerName /* if backend already provides it */ ||
        ownerNameFromMap ||
        (f.ownerId ? `User #${f.ownerId}` : "Unknown");
      return { ...f, owner };
    });
  }, [functions, usersMap]);

  return (
    <AppLayout>
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>All Functions</CardTitle>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.id}</TableCell>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.owner}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {f.runtime}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatUploadTime(f.uploadTime)}
                      </TableCell>
                      <TableCell>{getStatusBadge(f.status)}</TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No functions found
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
