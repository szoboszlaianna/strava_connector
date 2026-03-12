import { z } from "zod";
import { StravaActivity } from "../types.js";
import { formatTime, formatPace, formatSpeed, formatElevation } from "../utils.js";
import { stravaApi, handleStravaError } from "../strava.js";

export const getRecentActivitiesTool = {
  description:
    "Get recent running/cycling activities from Strava. Returns detailed metrics including distance, pace, heart rate, elevation, and social engagement data.",
  inputSchema: {
    limit: z
      .number()
      .min(1)
      .max(30)
      .default(10)
      .describe("Number of activities to fetch (default 10, max 30)"),
    activity_type: z
      .string()
      .optional()
      .describe(
        "Filter by activity type (Run, Ride, Swim, etc.). Leave empty for all types",
      ),
  },
  handler: async ({ limit = 10, activity_type }: { limit?: number; activity_type?: string }) => {
    try {
      const response = await stravaApi.get("/athlete/activities", {
        params: {
          per_page: Math.min(limit, 30),
          page: 1,
        },
      });

      let activities: StravaActivity[] = response.data;

      // Filter by activity type if specified
      if (activity_type) {
        activities = activities.filter(
          (activity) =>
            activity.type.toLowerCase() === activity_type.toLowerCase(),
        );
      }

      const formattedActivities = activities.map((activity) => {
        const activityDate = new Date(activity.start_date_local);
        return {
          id: activity.id,
          name: activity.name,
          type: activity.type,
          date: activityDate.toLocaleDateString(),
          day_of_week: activityDate.toLocaleDateString("en-US", {
            weekday: "long",
          }),
          time: activityDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          distance: {
            kilometers: (activity.distance / 1000).toFixed(2),
            meters: activity.distance,
          },
          duration: {
            formatted: formatTime(activity.moving_time),
            moving_time_seconds: activity.moving_time,
            elapsed_time_seconds: activity.elapsed_time,
            moving_time_minutes: Math.round(activity.moving_time / 60),
          },
          pace: {
            per_km: formatPace(activity.average_speed),
          },
          speed: {
            average_kmh: formatSpeed(activity.average_speed),
            max_kmh: formatSpeed(activity.max_speed),
            average_ms: activity.average_speed,
          },
          elevation: {
            gain_meters: formatElevation(activity.total_elevation_gain),
            highest_point: activity.elev_high
              ? formatElevation(activity.elev_high)
              : "N/A",
            lowest_point: activity.elev_low
              ? formatElevation(activity.elev_low)
              : "N/A",
          },
          heart_rate: {
            average: activity.average_heartrate || null,
            max: activity.max_heartrate || null,
          },
          engagement: {
            kudos: activity.kudos_count || 0,
            comments: activity.comment_count || 0,
            achievements: activity.achievement_count || 0,
          },
          performance: {
            suffer_score: activity.suffer_score || null,
            calories_estimated: activity.kilojoules
              ? Math.round(activity.kilojoules * 0.239)
              : null,
            workout_type: activity.workout_type || null,
          },
        };
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(formattedActivities, null, 2),
          },
        ],
      };
    } catch (error) {
      throw handleStravaError(error);
    }
  },
};
