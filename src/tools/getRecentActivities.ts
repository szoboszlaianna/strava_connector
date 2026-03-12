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
          resource_state: activity.resource_state,
          external_id: activity.external_id,
          upload_id: activity.upload_id,
          upload_id_str: activity.upload_id_str,
          name: activity.name,
          type: activity.type,
          sport_type: activity.sport_type,
          device_name: activity.device_name,
          date: activityDate.toLocaleDateString(),
          day_of_week: activityDate.toLocaleDateString("en-US", {
            weekday: "long",
          }),
          time: activityDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          start_date: activity.start_date,
          start_date_local: activity.start_date_local,
          timezone: activity.timezone,
          utc_offset: activity.utc_offset,
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
            max_ms: activity.max_speed,
          },
          elevation: {
            gain_meters: formatElevation(activity.total_elevation_gain),
            highest_point: activity.elev_high
              ? formatElevation(activity.elev_high)
              : "N/A",
            lowest_point: activity.elev_low
              ? formatElevation(activity.elev_low)
              : "N/A",
            total_elevation_gain: activity.total_elevation_gain,
          },
          location: {
            city: activity.location_city,
            state: activity.location_state,
            country: activity.location_country,
            start_latlng: activity.start_latlng,
            end_latlng: activity.end_latlng,
          },
          heart_rate: {
            average: activity.average_heartrate || null,
            max: activity.max_heartrate || null,
            has_heartrate: activity.has_heartrate,
            opt_out: activity.heartrate_opt_out || false,
          },
          power: {
            average_watts: activity.average_watts || null,
            max_watts: activity.max_watts || null,
            weighted_average_watts: activity.weighted_average_watts || null,
            device_watts: activity.device_watts || false,
            average_cadence: activity.average_cadence || null,
            average_temp: activity.average_temp || null,
            kilojoules: activity.kilojoules || null,
            calories_estimated: activity.kilojoules
              ? Math.round(activity.kilojoules * 0.239)
              : null,
          },
          engagement: {
            kudos: activity.kudos_count || 0,
            comments: activity.comment_count || 0,
            achievements: activity.achievement_count || 0,
            athletes_count: activity.athlete_count || 1,
            photos: activity.photo_count || 0,
            has_kudoed: activity.has_kudoed,
            pr_count: activity.pr_count || 0,
          },
          flags: {
            trainer: activity.trainer,
            commute: activity.commute,
            manual: activity.manual,
            private: activity.private,
            flagged: activity.flagged,
            from_accepted_tag: activity.from_accepted_tag,
          },
          gear_id: activity.gear_id,
          map: activity.map,
          performance: {
            workout_type: activity.workout_type || null,
            total_photo_count: activity.total_photo_count || 0,
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
