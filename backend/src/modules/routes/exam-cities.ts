export type ExamCity = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

/** B კატეგორიის ქალაქის პრაქტიკული გამოცდის ქალაქები */
export const EXAM_CITIES: ExamCity[] = [
  { id: 'rustavi', name: 'რუსთავი', lat: 41.5493, lng: 44.9992 },
  { id: 'sachkhere', name: 'საჩხერე', lat: 42.3453, lng: 43.4194 },
  { id: 'kutaisi', name: 'ქუთაისი', lat: 42.2679, lng: 42.6946 },
  { id: 'poti', name: 'ფოთი', lat: 42.1465, lng: 41.672 },
  { id: 'zugdidi', name: 'ზუგდიდი', lat: 42.5088, lng: 41.8709 },
  { id: 'akhaltsikhe', name: 'ახალციხე', lat: 41.639, lng: 42.9858 },
  { id: 'batumi', name: 'ბათუმი', lat: 41.6168, lng: 41.6367 },
  { id: 'gori', name: 'გორი', lat: 41.9842, lng: 44.1158 },
  { id: 'ozurgeti', name: 'ოზურგეთი', lat: 41.9244, lng: 42.0058 },
  { id: 'telavi', name: 'თელავი', lat: 41.9198, lng: 45.4731 },
];

export const EXAM_CITY_NAMES = EXAM_CITIES.map((city) => city.name);
