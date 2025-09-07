import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { IssueService } from "../../services/issueService";
import { LocationService } from "../../utils/location";
import { ImageUtils } from "../../utils/imageUtils";
import type { IssueCategory, IssueFormData } from "../../types";
import { Camera, MapPin, Upload, CheckCircle } from "lucide-react";
import styles from "./IssueReportForm.module.css";

const ISSUE_CATEGORIES: { value: IssueCategory; label: string }[] = [
  { value: "pothole", label: "Pothole" },
  { value: "garbage", label: "Garbage/Waste" },
  { value: "sewage", label: "Sewage Problem" },
  { value: "streetlight", label: "Streetlight Issue" },
  { value: "others", label: "Others" },
];

const IssueReportForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<IssueFormData>({
    photo: null,
    category: "pothole",
    description: "",
    location: { latitude: 0, longitude: 0 },
  });

  // UI state
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [locationError, setLocationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Get user location on component mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = async () => {
    setLocationStatus("loading");
    setLocationError("");

    try {
      const position = await LocationService.getCurrentPosition();
      setFormData((prev) => ({
        ...prev,
        location: position,
      }));
      setLocationStatus("success");
    } catch (error: any) {
      setLocationError(error.message);
      setLocationStatus("error");
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = ImageUtils.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid image file");
      return;
    }

    try {
      // Compress image
      const compressedFile = await ImageUtils.compressImage(file);

      // Create preview
      const preview = await ImageUtils.createImagePreview(compressedFile);

      setFormData((prev) => ({ ...prev, photo: compressedFile }));
      setPhotoPreview(preview);
      setError("");
    } catch (error) {
      setError("Failed to process image");
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      category: e.target.value as IssueCategory,
    }));
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Since we now require auth, currentUser should always exist
    if (!currentUser) {
      setError("You must be logged in to report issues");
      navigate("/login");
      return;
    }

    if (!formData.photo) {
      setError("Please upload a photo of the issue");
      return;
    }

    if (locationStatus !== "success") {
      setError("Please enable location access to report the issue");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please provide a description of the issue");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      console.log(
        "📝 Submitting issue as authenticated user:",
        currentUser.email
      );

      const issueId = await IssueService.createIssue(
        formData,
        currentUser.id,
        currentUser.email || null // Convert undefined to null
      );

      console.log("✅ Issue submitted with ID:", issueId);
      // In the handleSubmit function, find this section:
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard"); // Always go to dashboard after successful report
      }, 2000);
    } catch (error: any) {
      console.error("❌ Submit error:", error);
      setError(error.message || "Failed to submit issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <CheckCircle size={64} className={styles.successIcon} />
          <h2>Issue Reported Successfully!</h2>
          <p>
            Thank you for helping improve our community. You'll be redirected to
            your dashboard shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Report an Issue</h1>
        <p className={styles.subtitle}>
          Help improve your community by reporting civic problems
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Photo Upload */}
          <div className={styles.photoSection}>
            <label className={styles.sectionLabel}>
              <Camera size={20} />
              Photo Evidence *
            </label>

            {!photoPreview ? (
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="file-input"
                  id="photo-input"
                />
                <label htmlFor="photo-input" className="file-input-label">
                  <Upload size={24} />
                  <span>Take Photo or Upload Image</span>
                  <small>Max 10MB • JPEG, PNG, WebP</small>
                </label>
              </div>
            ) : (
              <div className={styles.photoPreview}>
                <img src={photoPreview} alt="Issue preview" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview("");
                    setFormData((prev) => ({ ...prev, photo: null }));
                  }}
                  className={styles.removePhoto}
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div className={styles.locationSection}>
            <label className={styles.sectionLabel}>
              <MapPin size={20} />
              Location
            </label>

            <div className={styles.locationStatus}>
              {locationStatus === "loading" && (
                <div className={styles.locationLoading}>
                  <span className="spinner"></span>
                  Getting your location...
                </div>
              )}

              {locationStatus === "success" && (
                <div className={styles.locationSuccess}>
                  <CheckCircle size={16} />
                  Location detected successfully
                  <small>
                    {formData.location.latitude.toFixed(6)},{" "}
                    {formData.location.longitude.toFixed(6)}
                  </small>
                </div>
              )}

              {locationStatus === "error" && (
                <div className={styles.locationError}>
                  <span>{locationError}</span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className={styles.retryButton}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Issue Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className="form-select"
              required
            >
              {ISSUE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe the issue in detail..."
              className="form-textarea"
              required
              rows={4}
            />
          </div>

          {!currentUser && (
            <div className={styles.guestWarning}>
              <p>
                📝 <strong>Tip:</strong> Create a free account to:
              </p>
              <ul>
                <li>✅ Reliable photo uploads</li>
                <li>✅ Track your issue reports</li>
                <li>✅ Get status updates</li>
              </ul>
              <Link
                to="/register"
                className="btn btn-secondary"
                style={{ marginRight: "1rem" }}
              >
                Create Account (30 sec)
              </Link>
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                or continue as guest
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || locationStatus !== "success"}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Submitting Issue...
              </>
            ) : (
              "Submit Issue Report"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueReportForm;
