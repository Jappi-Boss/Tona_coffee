/** Feedback shares the contact inbox so existing records and permissions remain valid. */
export function isFeedbackRequest(row: Record<string, unknown>) {
  const type = String(row["request_type"] ?? "").toLowerCase();
  return type === "feedback" || type.startsWith("feedback_");
}

export function requestLabel(value: unknown) {
  const labels: Record<string, string> = {
    location_request: "Location request",
    feedback_rating: "Coffee rating", feedback_general: "General feedback",
    feedback_problem: "Reported problem", feedback: "Feedback",
  };
  const type = String(value ?? "");
  return labels[type] ?? type.replaceAll("_", " ");
}

export function requestView(row: Record<string, unknown>) {
  if (row["request_type"] === "location_request") return "locationRequests";
  return isFeedbackRequest(row) ? "feedback" : "contacts";
}
