import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatsCards from "../components/dashboard/StatsCards";
import IssuesMap from "../components/map/IssuesMap";
import IssueList from "../components/dashboard/IssueList";
import { Map, List, Filter } from "lucide-react";
import type { IssueStatus } from "../types";

const AdminDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const {
    issues,
    filteredIssues,
    loading,
    error,
    view,
    setView,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    loadIssues,
    updateIssueStatus,
    // Remove: isConnected, lastUpdate
  } = useDashboard(undefined, true);

  // Redirect non-admin users
  React.useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate("/dashboard");
    }
  }, [currentUser, isAdmin, navigate]);

  const handleStatusUpdate = async (
    issueId: string,
    newStatus: IssueStatus
  ) => {
    try {
      await updateIssueStatus(issueId, newStatus);
    } catch (error: any) {
      alert("Failed to update issue status: " + error.message);
    }
  };

  if (!currentUser || !isAdmin) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        subtitle={`Admin Control Panel • Manage ${issues.length} community issues • Status Change Authority`}
        isAdminView={true}
        // Remove: isConnected={isConnected}, lastUpdate={lastUpdate}
      >
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <span
            className="spinner"
            style={{ width: "40px", height: "40px" }}
          ></span>
          <p style={{ marginTop: "1rem", color: "#64748b" }}>
            Loading all issues...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle={`System Overview • ${issues.length} total issues across all users`}
      isAdminView={true}
    >
      {/* Stats Cards */}
      <StatsCards issues={issues} />

      {/* Controls */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {/* View Toggle */}
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: "8px",
            padding: "4px",
          }}
        >
          <button
            onClick={() => setView("map")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: view === "map" ? "white" : "transparent",
              color: view === "map" ? "#1e293b" : "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              boxShadow: view === "map" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <Map size={16} />
            Map View
          </button>
          <button
            onClick={() => setView("list")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              background: view === "list" ? "white" : "transparent",
              color: view === "list" ? "#1e293b" : "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              boxShadow: view === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <List size={16} />
            List View
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} color="#64748b" />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as IssueStatus | "all")
            }
            className="form-select"
            style={{ minWidth: "120px" }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ minWidth: "140px" }}
          >
            <option value="all">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage</option>
            <option value="sewage">Sewage</option>
            <option value="streetlight">Streetlight</option>
            <option value="others">Others</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          <p>{error}</p>
          <button onClick={loadIssues} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!error && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0, color: "#1e293b" }}>
              All Issues {view === "map" ? "Map" : "List"} (
              {filteredIssues.length}{" "}
              {filteredIssues.length === 1 ? "issue" : "issues"})
            </h3>

            {/* Quick Action Buttons */}
            <div
              style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}
            >
              <button
                onClick={() => setStatusFilter("pending")}
                style={{
                  background:
                    statusFilter === "pending" ? "#f59e0b" : "#fef3c7",
                  color: statusFilter === "pending" ? "white" : "#92400e",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Show Pending
              </button>
              <button
                onClick={() => setStatusFilter("in-progress")}
                style={{
                  background:
                    statusFilter === "in-progress" ? "#3b82f6" : "#dbeafe",
                  color: statusFilter === "in-progress" ? "white" : "#1e40af",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                style={{
                  background: statusFilter === "all" ? "#6b7280" : "#f3f4f6",
                  color: statusFilter === "all" ? "white" : "#374151",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Show All
              </button>
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}
            >
              <h4>No issues found</h4>
              <p>
                No issues match your current filters. Try adjusting the filters
                above.
              </p>
            </div>
          ) : (
            <>
              {/* Map View */}
              {view === "map" && (
                <div>
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      background: "#f0f4ff",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      color: "#4338ca",
                    }}
                  >
                    🗺️ <strong>Admin Map View:</strong> Click markers to see
                    details. Use status buttons above for quick filtering.
                    <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                      {" "}
                      Red = Pending
                    </span>
                    ,
                    <span style={{ color: "#2563eb", fontWeight: "bold" }}>
                      {" "}
                      Blue = In Progress
                    </span>
                    ,
                    <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                      {" "}
                      Green = Resolved
                    </span>
                  </div>
                  <IssuesMap issues={filteredIssues} />
                </div>
              )}

              {/* List View */}
              {view === "list" && (
                <IssueList
                  issues={filteredIssues}
                  isAdminView={true}
                  onStatusUpdate={handleStatusUpdate}
                />
              )}
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
