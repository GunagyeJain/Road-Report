import React from "react";
import type { Issue, IssueStatus } from "../../types";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface IssueListProps {
  issues: Issue[];
  isAdminView?: boolean;
  onStatusUpdate?: (issueId: string, status: IssueStatus) => void;
}

const IssueList: React.FC<IssueListProps> = ({
  issues,
  isAdminView = false,
  onStatusUpdate,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "in-progress":
        return <AlertCircle size={16} />;
      case "resolved":
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "in-progress":
        return "#3b82f6";
      case "resolved":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  if (issues.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
        <h3>No issues found</h3>
        <p>
          {isAdminView
            ? "No issues match your current filters."
            : "You haven't reported any issues yet."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {issues.map((issue) => (
        <div
          key={issue.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "1rem",
            background: "white",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto auto",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          {/* Status & Photo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {issue.photoURL && (
              <img
                src={issue.photoURL}
                alt="Issue"
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            )}
            <div
              style={{
                background: getStatusColor(issue.status) + "20",
                color: getStatusColor(issue.status),
                padding: "0.25rem 0.5rem",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              {getStatusIcon(issue.status)}
              {issue.status.replace("-", " ").toUpperCase()}
            </div>
          </div>

          {/* Details */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem", color: "#1e293b" }}>
              {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}{" "}
              Issue
            </h4>
            <p
              style={{
                margin: "0 0 0.5rem",
                color: "#374151",
                fontSize: "0.875rem",
              }}
            >
              {issue.description}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                fontSize: "0.75rem",
                color: "#6b7280",
                flexWrap: "wrap",
              }}
            >
              <span>
                📍 {issue.location.latitude.toFixed(4)},{" "}
                {issue.location.longitude.toFixed(4)}
              </span>
              <span>👤 {issue.reporterEmail || "Anonymous"}</span>
              <span>📅 {new Date(issue.timestamp).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdminView && onStatusUpdate && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {issue.status === "pending" && (
                <button
                  onClick={() => onStatusUpdate(issue.id, "in-progress")}
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Start Progress
                </button>
              )}

              {issue.status === "in-progress" && (
                <button
                  onClick={() => onStatusUpdate(issue.id, "resolved")}
                  style={{
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Mark Resolved
                </button>
              )}

              {/* Allow admins to change any status */}
              <select
                value={issue.status}
                onChange={(e) =>
                  onStatusUpdate(issue.id, e.target.value as IssueStatus)
                }
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.75rem",
                }}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IssueList;
