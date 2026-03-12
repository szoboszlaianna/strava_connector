import axios from "axios";

const STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN || "f0e7e9a6a71b744839cd9fb2eff7a7f429d65532";

// Strava API client
export const stravaApi = axios.create({
  baseURL: "https://www.strava.com/api/v3",
  headers: {
    Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}`,
  },
});

// Error handling function
export function handleStravaError(error: any): Error {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      return new Error(
        "Strava authentication failed. Please check your access token.",
      );
    } else if (statusCode === 403) {
      return new Error(
        "Strava access forbidden. Your token might not have the required permissions.",
      );
    } else if (statusCode === 429) {
      return new Error(
        "Strava API rate limit exceeded. Please try again later.",
      );
    } else if (statusCode === 404) {
      return new Error("Requested Strava resource not found.");
    }

    return new Error(`Strava API error (${statusCode}): ${errorMessage}`);
  } else if (error instanceof Error) {
    return new Error(`Error: ${error.message}`);
  } else {
    return new Error("Unknown error occurred");
  }
}
