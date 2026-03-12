export interface StravaActivity {
  resource_state: number;
  athlete: {
    id: number;
    resource_state: number;
  };
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type: number | null;
  device_name: string;
  id: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline?: string;
    polyline?: string;
    resource_state: number;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility?: string;
  flagged: boolean;
  gear_id: string | null;
  start_latlng: number[];
  end_latlng: number[];
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_temp?: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  device_watts?: boolean;
  kilojoules?: number;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  heartrate_opt_out?: boolean;
  display_hide_heartrate_option?: boolean;
  elev_high: number;
  elev_low: number;
  upload_id: number;
  upload_id_str?: string;
  external_id: string;
  from_accepted_tag: boolean;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
}

export interface StravaActivityDetails extends StravaActivity {
  description?: string;
  calories?: number;
  segment_efforts?: SegmentEffort[];
  splits_metric?: Split[];
  laps?: Lap[];
  gear?: Gear;
  partner_brand_tag?: string | null;
  photos?: {
    primary?: Photo | null;
    use_primary_photo?: boolean;
    count?: number;
  };
  highlighted_kudosers?: KudoUser[];
  hide_from_home?: boolean;
  embed_token?: string;
  segment_leaderboard_opt_out?: boolean;
  leaderboard_opt_out?: boolean;
  suffer_score?: number | null;
}

export interface SegmentEffort {
  id: number;
  resource_state: number;
  name: string;
  activity: {
    id: number;
    resource_state: number;
  };
  athlete: {
    id: number;
    resource_state: number;
  };
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  average_cadence?: number;
  device_watts?: boolean;
  average_watts?: number;
  segment: Segment;
  kom_rank: number | null;
  pr_rank: number | null;
  achievements: unknown[];
  hidden: boolean;
}

export interface Segment {
  id: number;
  resource_state: number;
  name: string;
  activity_type: string;
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: number[];
  end_latlng: number[];
  climb_category: number;
  city: string;
  state: string;
  country: string;
  private: boolean;
  hazardous: boolean;
  starred: boolean;
}

export interface Split {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  pace_zone: number;
}

export interface Lap {
  id: number;
  resource_state: number;
  name: string;
  activity: {
    id: number;
    resource_state: number;
  };
  athlete: {
    id: number;
    resource_state: number;
  };
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  device_watts?: boolean;
  average_watts?: number;
  lap_index: number;
  split: number;
}

export interface Gear {
  id: string;
  primary: boolean;
  name: string;
  resource_state: number;
  distance: number;
}

export interface Photo {
  id: number | null;
  unique_id: string;
  urls: {
    [key: string]: string;
  };
  source: number;
}

export interface KudoUser {
  destination_url: string;
  display_name: string;
  avatar_url: string;
  show_name: boolean;
}

export interface StravaAthlete {
  id: number;
  username: string;
  resource_state: number;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
  badge_type_id: number;
  profile_medium: string;
  profile: string;
  friend: boolean | null;
  follower: boolean | null;
  follower_count: number;
  friend_count: number;
  mutual_friend_count: number;
  athlete_type: number;
  date_preference: string;
  measurement_preference: string;
  clubs: unknown[];
  ftp: number | null;
  weight: number;
  bikes: {
    id: string;
    primary: boolean;
    name: string;
    resource_state: number;
    distance: number;
  }[];
  shoes: {
    id: string;
    primary: boolean;
    name: string;
    resource_state: number;
    distance: number;
  }[];
}
