export type ExamCity = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

/** B კატეგორიის ქალაქის პრაქტიკული გამოცდის ქალაქები */
export const EXAM_CITIES: ExamCity[] = [
  { id: 'batumi', name: 'ბათუმი', lat: 41.6168, lng: 41.6367 },
];

export const EXAM_CITY_NAMES = EXAM_CITIES.map((city) => city.name);
