"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  action: string;
  details: string;
  createdAt: string;
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    user: "",
    action: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error("No access token found. Please login as admin.");
      }

      const queryParams = new URLSearchParams();
      if (filters.user) queryParams.append("user", filters.user);
      if (filters.action) queryParams.append("action", filters.action);

      const response = await fetch(`/api/admin/activity-logs?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const data: ActivityLogsResponse = await response.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseDetails = (detailsString: string) => {
    try {
      return JSON.parse(detailsString);
    } catch {
      return { message: detailsString };
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("ban") || action.includes("reject") || action.includes("delete")) {
      return "destructive";
    }
    if (action.includes("approve") || action.includes("feature") || action.includes("create")) {
      return "default";
    }
    if (action.includes("update") || action.includes("settings")) {
      return "secondary";
    }
    return "outline";
  };

  const getModuleFromAction = (action: string) => {
    const parts = action.split(".");
    return parts[0] || "unknown";
  };

  const getOperationFromAction = (action: string) => {
    const parts = action.split(".");
    return parts[1] || action;
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Activity Logs</h1>
          <Button onClick={fetchLogs} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-filter">Filter by User</Label>
                <Input
                  id="user-filter"
                  placeholder="Enter user email or name"
                  value={filters.user}
                  onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="action-filter">Filter by Action</Label>
                <Input
                  id="action-filter"
                  placeholder="Enter action type"
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs ({logs.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading activity logs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
                <Button onClick={fetchLogs} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activity logs found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const details = parseDetails(log.details);
                      const module = getModuleFromAction(log.action);
                      const operation = getOperationFromAction(log.action);
                      
                      return (
                        <TableRow key={log._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.user.fullName}</div>
                              <div className="text-sm text-muted-foreground">{log.user.email}</div>
                              <Badge variant="outline" className="mt-1">
                                {log.user.role}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{module}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(operation)}>
                              {operation.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="text-sm font-medium">
                                {details.message || operation}
                              </div>
                              {details.entityId && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  ID: {details.entityId}
                                </div>
                              )}
                              {details.changes && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Changes: {Object.keys(details.changes).join(", ")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(log.createdAt)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
