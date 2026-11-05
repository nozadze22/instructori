export type SystemRoutePayload = {
  routeId: string;
  title: string;
  city: string | null;
  action: 'created' | 'updated' | 'catalog_sync';
  createdCount?: number;
  updatedCount?: number;
};

/** Narrow port for route notifications (stable type for ESLint / callers). */
export type NotificationRouteEvents = {
  publishSystemRoute(payload: SystemRoutePayload): void;
};
