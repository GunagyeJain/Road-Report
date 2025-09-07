import React from "react";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatsCards from "../components/dashboard/StatsCards";
import IssuesMap from "../components/map/IssuesMap";
import IssueList from "../components/dashboard/IssueList";
import { Map, List, Filter } from "lucide-react";
import type { IssueStatus } from "../types";
import { Link } from 'react-router-dom'

const SimpleDashboard: React.FC = () => {
  const { currentUser } = useAuth();

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
  } = useDashboard(currentUser?.id, false);

  if (loading) {
    return (
      <DashboardLayout
        title="My Dashboard"
        subtitle={`Welcome back, ${currentUser?.email}`}
      >
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <span
            className="spinner"
            style={{ width: "40px", height: "40px" }}
          ></span>
          <p style={{ marginTop: "1rem", color: "#64748b" }}>
            Loading your issues...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Dashboard"
      subtitle={`Track your reported issues • ${issues.length} total reports`}
    >
      {/* Stats Cards */}
      <StatsCards issues={issues} />
      {/* Welcome Message for New Users */}
      {issues.length === 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏘️</div>
          <h3 style={{ margin: "0 0 1rem", color: "#1e293b" }}>
            Welcome to CivicReport!
          </h3>
          <p
            style={{
              color: "#6b7280",
              marginBottom: "1.5rem",
              maxWidth: "500px",
              margin: "0 auto 1.5rem",
            }}
          >
            You haven't reported any issues yet. Start making a difference in
            your community by reporting civic problems that need attention.
          </p>
          <Link
            to="/report"
            className="btn btn-primary"
            style={{
              fontSize: "1rem",
              padding: "0.75rem 2rem",
            }}
          >
            🚀 Report Your First Issue
          </Link>
        </div>
      )}

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
          <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#1e293b" }}>
            Your Issues {view === "map" ? "Map" : "List"} (
            {filteredIssues.length}{" "}
            {filteredIssues.length === 1 ? "issue" : "issues"})
          </h3>

          {filteredIssues.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}
            >
              <h4>No issues found</h4>
              <p>
                {issues.length === 0
                  ? "You haven't reported any issues yet. Start making a difference in your community!"
                  : "No issues match your current filters. Try adjusting the filters above."}
              </p>
              {issues.length === 0 && (
                <a
                  href="/report"
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                >
                  Report Your First Issue
                </a>
              )}
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
                      background: "#f0f9ff",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      color: "#0369a1",
                    }}
                  >
                    💡 <strong>Tip:</strong> Click on any marker to see issue
                    details. Different colors represent different statuses:
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
                <IssueList issues={filteredIssues} isAdminView={false} />
              )}
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SimpleDashboard;
