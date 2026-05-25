export const ApiEndpoints = {
  login: (host: string) => `${host}/panel_api.php?username={username}&password={password}`,
  categories: (host: string) => `${host}/panel_api.php?action=get_categories`,
  livestreams: (host: string, categoryId?: number) =>
    categoryId
      ? `${host}/panel_api.php?action=get_live_streams&category_id=${categoryId}`
      : `${host}/panel_api.php?action=get_live_streams`,
  epg: (host: string, streamId: number, limit?: number) =>
    `${host}/panel_api.php?action=get_short_epg&stream_id=${streamId}${limit ? `&limit=${limit}` : ''}`,
} as const;
