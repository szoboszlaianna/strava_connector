import { z } from "zod";
import { StravaActivity } from "../types.js";
import { formatTime, formatPace, formatSpeed, formatElevation } from "../utils.js";
import { stravaApi, handleStravaError } from "../strava.js";

export const getMonthlySatsTool = {
  description:
    "Get activities and statistics for a specific month, useful for analyzing monthly performance trends.",
  inputSchema: {
    year: z
      .number()
      .min(2000)
      .max(new Date().getFullYear() + 1)
      .describe("Year (e.g., 2024)"),
    month: z.number().min(1).max(12).describe("Month (1-12)"),
    activity_type: z
      .string()
      .optional()
      .describe(
        "Filter by activity type (Run, Ride, Swim, etc.). Leave empty for all types",
      ),
  },
  handler: async ({
    year,
    month,
    activity_type,
  }: {
    year: number;
    month: number;
    activity_type?: string;
  }) => {
    try {
      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month

      // Convert to Unix timestamps for Strava API
      const before = Math.floor(endDate.getTime() / 1000) + 86400; // Add a day to include the last day
      const after = Math.floor(startDate.getTime() / 1000);

      const response = await stravaApi.get("/athlete/activities", {
        params: {
          before: before,
          after: after,
          per_page: 200, // Get more activities for monthly analysis
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

      // Calculate monthly statistics
      const totalActivities = activities.length;
      const totalDistance = activities.reduce(
        (sum, activity) => sum + activity.distance,
        0,
      );
      const totalMovingTime = activities.reduce(
        (sum, activity) => sum + activity.moving_time,
        0,
      );
      const totalElevationGain = activities.reduce(
        (sum, activity) => sum + activity.total_elevation_gain,
        0,
      );

      const averageDistance =
        totalActivities > 0 ? totalDistance / totalActivities : 0;
      const averageMovingTime =
        totalActivities > 0 ? totalMovingTime / totalActivities : 0;
      const averageSpeed =
        totalMovingTime > 0 ? totalDistance / totalMovingTime : 0;

      const monthlyStats = {
        month_info: {
          year: year,
          month: month,
          month_name: new Date(year, month - 1).toLocaleDateString("en-US", {
            month: "long",
          }),
          activity_type_filter: activity_type || "All activities",
        },
        summary: {
          total_activities: totalActivities,
          total_distance: {
            kilometers: (totalDistance / 1000).toFixed(2),
            meters: Math.round(totalDistance),
          },
          total_moving_time: {
            formatted: formatTime(totalMovingTime),
            hours: (totalMovingTime / 3600).toFixed(1),
            minutes: Math.round(totalMovingTime / 60),
          },
          total_elevation_gain: {
            meters: formatElevation(totalElevationGain),
          },
        },
        averages: {
          distance: {
            kilometers: (averageDistance / 1000).toFixed(2),
          },
          duration: {
            formatted: formatTime(averageMovingTime),
            minutes: Math.round(averageMovingTime / 60),
          },
          pace_per_km: formatPace(averageSpeed),
          speed_kmh: formatSpeed(averageSpeed),
        },
        activities: activities.map((activity) => ({
          id: activity.id,
          name: activity.name,
          type: activity.type,
          date: new Date(activity.start_date_local).toLocaleDateString(),
          distance_km: (activity.distance / 1000).toFixed(2),
          duration: formatTime(activity.moving_time),
          pace_per_km: formatPace(activity.average_speed),
        })),
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(monthlyStats, null, 2),
          },
        ],
      };
    } catch (error) {
      throw handleStravaError(error);
    }
  },
};
