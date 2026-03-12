import { z } from "zod";
import { StravaActivity } from "../types.js";
import { formatTime, formatPace, formatSpeed, formatElevation } from "../utils.js";
import { stravaApi, handleStravaError } from "../strava.js";

export const getActivityDetailsTool = {
  description:
    "Get comprehensive details about a specific activity including performance metrics, duration, elevation, and social data.",
  inputSchema: {
    activity_id: z.number().positive().describe("The Strava activity ID"),
  },
  handler: async ({ activity_id }: { activity_id: number }) => {
    try {
      const response = await stravaApi.get(`/activities/${activity_id}`);
      const activity: StravaActivity = response.data;

      const activityDate = new Date(activity.start_date_local);
      const details = {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        description: (activity as any).description || null,
        date_time: {
          date: activityDate.toLocaleDateString(),
          time: activityDate.toLocaleTimeString(),
          day_of_week: activityDate.toLocaleDateString("en-US", {
            weekday: "long",
          }),
          iso_date: activity.start_date_local,
        },
        distance: {
          kilometers: (activity.distance / 1000).toFixed(2),
          meters: activity.distance,
        },
        duration: {
          moving_time: formatTime(activity.moving_time),
          elapsed_time: formatTime(activity.elapsed_time),
          moving_time_seconds: activity.moving_time,
          elapsed_time_seconds: activity.elapsed_time,
        },

        pace_and_speed: {
          average_pace_per_km: formatPace(activity.average_speed),
          average_speed_kmh: formatSpeed(activity.average_speed),
          max_speed_kmh: formatSpeed(activity.max_speed),
        },
        elevation: {
          total_gain_meters: formatElevation(activity.total_elevation_gain),
          highest_point_meters: activity.elev_high
            ? formatElevation(activity.elev_high)
            : "N/A",
          lowest_point_meters: activity.elev_low
            ? formatElevation(activity.elev_low)
            : "N/A",
        },
        heart_rate: {
          average_bpm: activity.average_heartrate || null,
          max_bpm: activity.max_heartrate || null,
        },
        performance_metrics: {
          suffer_score: activity.suffer_score || null,
          estimated_calories: activity.kilojoules
            ? Math.round(activity.kilojoules * 0.239)
            : null,
          kilojoules: activity.kilojoules || null,
          workout_type: activity.workout_type || null,
        },
        social: {
          kudos_count: activity.kudos_count || 0,
          comment_count: activity.comment_count || 0,
          achievement_count: activity.achievement_count || 0,
          photo_count: activity.photo_count || 0,
          athlete_count: activity.athlete_count || 0,
        },
        raw_data: {
          average_speed_ms: activity.average_speed,
          max_speed_ms: activity.max_speed,
          distance_meters: activity.distance,
          elevation_gain_meters: activity.total_elevation_gain,
        },
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(details, null, 2),
          },
        ],
      };
    } catch (error) {
      throw handleStravaError(error);
    }
  },
};
