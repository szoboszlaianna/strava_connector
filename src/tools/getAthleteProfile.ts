import { z } from "zod";
import { StravaAthlete } from "../types.js";
import { stravaApi, handleStravaError } from "../strava.js";

export const getAthleteProfileTool = {
  description:
    "Get the athlete's profile information including name, location, and social stats.",
  inputSchema: {},
  handler: async () => {
    try {
      const response = await stravaApi.get("/athlete");
      const athlete: StravaAthlete = response.data;

      const profile = {
        basic_info: {
          name: `${athlete.firstname} ${athlete.lastname}`,
          location: `${athlete.city}, ${athlete.state}, ${athlete.country}`
            .replace(/^, , /, "")
            .replace(/, , /, ", "),
          member_since: new Date(athlete.created_at).toLocaleDateString(),
          profile_image_url: athlete.profile,
        },
        social: {
          followers: athlete.follower_count || 0,
          following: athlete.friend_count || 0,
        },
        strava_profile: {
          athlete_id: athlete.id,
          created_at: athlete.created_at,
        },
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(profile, null, 2),
          },
        ],
      };
    } catch (error) {
      throw handleStravaError(error);
    }
  },
};
