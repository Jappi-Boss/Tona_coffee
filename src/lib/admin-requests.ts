/** Feedback shares the contact inbox so existing records and permissions remain valid. */
export function isFeedbackRequest(row: Record<string, unknown>) {
  const type = String(row["request_type"] ?? "").toLowerCase();
  return type === "feedback" || type.startsWith("feedback_");
}

export function requestLabel(value: unknown) {
  const labels: Record<string, string> = {
    location_request: "Location request",
    feedback_rating: "Rate your coffee", feedback_general: "Give general feedback",
    feedback_problem: "Report a problem", feedback: "Feedback",
    "Website enquiry: Feedback": "Feedback",
  };
  const type = String(value ?? "");
  return labels[type] ?? type.replaceAll("_", " ");
}

export function requestView(row: Record<string, unknown>) {
  if (row["request_type"] === "location_request") return "locationRequests";
  return isFeedbackRequest(row) ? "feedback" : "contacts";
}

export function feedbackFields(row: Record<string, unknown>) {
  const message = String(row.message ?? "");
  const lines = message.split("\n");
  const header = lines[0];
  if (!["Feedback: Rate your coffee", "Feedback: General feedback", "Feedback: Report a problem"].includes(header)) {
    return { comment: message, rating: "", purchaseLocation: "" };
  }

  lines.shift();
  let rating = "";
  let purchaseLocation = "";
  if (header === "Feedback: Rate your coffee" && lines.length > 1 && /^Rating: [1-5]\/5$/.test(lines[0])) {
    rating = lines.shift()!.slice("Rating: ".length);
  }
  if (row.coffee_interest && lines.length > 1 && lines[0] === `Product: ${row.coffee_interest}`) {
    lines.shift();
  }
  if (lines.length > 1 && lines[0].startsWith("Purchase location: ")) {
    purchaseLocation = lines.shift()!.slice("Purchase location: ".length);
  }
  return { comment: lines.join("\n"), rating, purchaseLocation };
}
