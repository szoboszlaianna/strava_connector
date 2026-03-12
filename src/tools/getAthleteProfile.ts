import { z } from "zod";
import { StravaAthlete } from "../types.js";
import { stravaApi, handleStravaError } from "../strava.js";

export const getAthleteProfileTool = {
  description:
    "Get the athlete's profile information including name, location, gears, bikes, shoes and social stats.",
  inputSchema: {},
  handler: async () => {
    try {
      const response = await stravaApi.get("/athlete");
      const athlete: StravaAthlete = response.data;

      const profile = {
        // Core identifiers
        id: athlete.id,
        resource_state: athlete.resource_state,
        
        // Basic info
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        name: `${athlete.firstname} ${athlete.lastname}`,
        username: athlete.username,
        
        // Location
        location: {
          city: athlete.city,
          state: athlete.state,
          country: athlete.country,
          formatted: `${athlete.city}, ${athlete.state}, ${athlete.country}`
            .replace(/^, , /, "")
            .replace(/, , /, ", "),
        },
        
        // Personal info
        sex: athlete.sex,
        premium: athlete.premium,
        athlete_type: athlete.athlete_type,
        
        // Profile images
        profile_images: {
          medium: athlete.profile_medium,
          large: athlete.profile,
        },
        
        // Account dates
        member_since: new Date(athlete.created_at).toLocaleDateString(),
        created_at: athlete.created_at,
        updated_at: athlete.updated_at,
        
        // Preferences
        preferences: {
          date_preference: athlete.date_preference,
          measurement_preference: athlete.measurement_preference,
        },
        
        // Social stats
        social: {
          followers: athlete.follower_count,
          following: athlete.friend_count,
          mutual_friends: athlete.mutual_friend_count,
          friend: athlete.friend,
          follower: athlete.follower,
        },
        
        // Performance
        ftp: athlete.ftp || null,
        weight: athlete.weight,
        badge_type_id: athlete.badge_type_id,
        
        // Equipment
        bikes: (athlete.bikes || []).map((bike) => ({
          id: bike.id,
          name: bike.name,
          primary: bike.primary,
          resource_state: bike.resource_state,
          distance: bike.distance,
        })),
        
        shoes: (athlete.shoes || []).map((shoe) => ({
          id: shoe.id,
          name: shoe.name,
          primary: shoe.primary,
          resource_state: shoe.resource_state,
          distance: shoe.distance,
        })),
        
        // Clubs
        clubs: (athlete.clubs || []).map((club: any) => ({
          id: club.id,
          name: club.name,
          resource_state: club.resource_state,
          sport_type: club.sport_type,
        })),
        
        // Summary
        strava_profile: {
          athlete_id: athlete.id,
          created_at: athlete.created_at,
          is_premium: athlete.premium,
          has_heartrate_data: (athlete.ftp !== null && athlete.ftp !== undefined),
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
