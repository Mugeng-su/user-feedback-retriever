type ErrorDisplay = {
  title: string;
  message: string;
  suggestion: string;
};

export function formatAnalysisError(error: unknown): ErrorDisplay {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const lower = rawMessage.toLowerCase();

  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("econnreset")) {
    return {
      title: "Model provider network request failed",
      message:
        "The app reached the model step, but the provider request failed before a usable response came back.",
      suggestion:
        "Most common causes: the model endpoint is temporarily unreachable, the model name is not available for this API key, the local network cannot reach the provider, or the provider service is down. Try again, check Settings model names, or switch to mock mode to keep testing the UI."
    };
  }

  if (lower.includes("model") && (lower.includes("not found") || lower.includes("404"))) {
    return {
      title: "Selected model name may be unavailable",
      message: rawMessage,
      suggestion:
        "Open Settings and check the provider model name. If you are using Gemini, try a known available Gemini model for your account, then restart the dev server if you changed .env."
    };
  }

  if (lower.includes("api_key") || lower.includes("api key") || lower.includes("not configured")) {
    return {
      title: "Provider API key is missing",
      message: rawMessage,
      suggestion:
        "Check the selected provider in Settings and make sure the matching API key is set in .env, then restart the dev server."
    };
  }

  if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("429")) {
    return {
      title: "Provider quota or rate limit was reached",
      message: rawMessage,
      suggestion:
        "Wait a moment and try again, or switch to another provider in Settings if you have another key configured."
    };
  }

  if (lower.includes("structured") || lower.includes("json") || lower.includes("parse")) {
    return {
      title: "The model response was not in the expected format",
      message: rawMessage,
      suggestion:
        "Try running the analysis again. If it repeats, the prompt/schema likely needs a small adjustment."
    };
  }

  if (lower.includes("all configured real analyzers failed")) {
    return {
      title: "All configured model providers failed",
      message: rawMessage.includes("fetch failed")
        ? "All real providers that were configured failed. In this run, the Gemini request failed at the network/request layer before returning a model response."
        : rawMessage,
      suggestion:
        "Check provider settings, API keys, model names, and provider availability. If the detail says `gemini: fetch failed`, try again later, verify the Gemini model name, or switch to mock mode to keep testing the UI."
    };
  }

  return {
    title: "Analysis failed",
    message: rawMessage || "Unexpected analysis error.",
    suggestion:
      "Check the input length, provider settings, API key configuration, and server logs for the full provider response."
  };
}

export function formatValidationIssues(issues: Record<string, string[] | undefined>) {
  const entries = Object.entries(issues)
    .filter(([, messages]) => messages && messages.length > 0)
    .map(([field, messages]) => `${field}: ${messages?.join(", ")}`);

  return entries.join("\n");
}
