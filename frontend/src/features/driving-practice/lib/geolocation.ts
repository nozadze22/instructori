export type GeoPoint = { lat: number; lng: number };

export function getCurrentGeoPoint(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("GPS ამ მოწყობილობაზე მიუწვდომელია."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "GPS-ის ნებართვა სჭირდება შეცდომის მოსმენისთვის."
              : "GPS ვერ მოიძებნა. სცადე თავიდან.",
          ),
        );
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 5_000 },
    );
  });
}
