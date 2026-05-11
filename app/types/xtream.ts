// Xtream Codes API Types

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface LiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: string;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface UserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
}

export interface Credentials {
  host: string;
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  userInfo?: UserInfo;
  error?: string;
}

export interface EpgListing {
  id: string;
  title: string;
  start: string;
  end: string | null;
  description?: string;
  start_timestamp?: string;
  stop_timestamp?: string;
  stop?: string;
  lang?: string;
  channel_id?: string;
  epg_id?: string;
}

export interface EpgResponse {
  epg_listings?: EpgListing[];
}
