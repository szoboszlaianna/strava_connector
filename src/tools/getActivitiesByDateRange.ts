import { z } from "zod";
import { StravaActivity } from "../types.js";
import { formatTime, formatPace, formatSpeed, formatElevation } from "../utils.js";
import { stravaApi, handleStravaError } from "../strava.js";

export const getActivitiesByDateRangeTool = {
  description:
    "Get activities within a specific date range for detailed analysis of performance over custom time periods.",
  inputSchema: {
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("Start date in YYYY-MM-DD format"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("End date in YYYY-MM-DD format"),
    activity_type: z
      .string()
      .optional()
      .describe(
        "Filter by activity type (Run, Ride, Swim, etc.). Leave empty for all types",
      ),
  },
  handler: async ({
    start_date,
    end_date,
    activity_type,
  }: {
    start_date: string;
    end_date: string;
    activity_type?: string;
  }) => {
    try {
      // Parse dates and convert to Unix timestamps
      const startTimestamp = Math.floor(new Date(start_date).getTime() / 1000);
      const endTimestamp =
        Math.floor(new Date(end_date).getTime() / 1000) + 86400; // Add a day

      const response = await stravaApi.get("/athlete/activities", {
        params: {
          before: endTimestamp,
          after: startTimestamp,
          per_page: 200,
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

      const result = {
        date_range: {
          start_date: start_date,
          end_date: end_date,
          activity_type_filter: activity_type || "All activities",
          total_activities_found: activities.length,
        },
        activities: activities.map((activity) => {
          const activityDate = new Date(activity.start_date_local);
          return {
            id: activity.id,
            name: activity.name,
            type: activity.type,
            date: activityDate.toLocaleDateString(),
            day_of_week: activityDate.toLocaleDateString("en-US", {
              weekday: "long",
            }),
            distance: {
              kilometers: (activity.distance / 1000).toFixed(2),
              meters: Math.round(activity.distance),
            },
            duration: {
              formatted: formatTime(activity.moving_time),
              minutes: Math.round(activity.moving_time / 60),
            },
            pace_per_km: formatPace(activity.average_speed),
            speed_kmh: formatSpeed(activity.average_speed),
            elevation_gain_meters: formatElevation(
              activity.total_elevation_gain,
            ),
            heart_rate: {
              average: activity.average_heartrate || null,
              max: activity.max_heartrate || null,
            },
            suffer_score: activity.suffer_score || null,
          };
        }),
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw handleStravaError(error);
    }
  },
};
