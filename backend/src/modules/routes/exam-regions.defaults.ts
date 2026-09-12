export type ExamRegionDefault = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  keywords: string[];
  isActive: boolean;
};

/** Known B-category exam cities — keywords match varied Route.city / sourceKey strings. */
export const DEFAULT_EXAM_REGIONS: ExamRegionDefault[] = [
  {
    id: 'batumi',
    name: 'ბათუმი',
    lat: 41.6168,
    lng: 41.6367,
    keywords: ['batumi', 'ბათუმ'],
    isActive: true,
  },
  {
    id: 'poti',
    name: 'ფოთი',
    lat: 42.1467,
    lng: 41.6719,
    keywords: ['poti', 'ფოთ'],
    isActive: true,
  },
  {
    id: 'ozurgeti',
    name: 'ოზურგეთი',
    lat: 41.9244,
    lng: 42.0068,
    keywords: ['ozurgeti', 'ოზურგეთ'],
    isActive: true,
  },
  {
    id: 'sachkhere',
    name: 'საჩხერე',
    lat: 42.3253,
    lng: 43.4322,
    keywords: ['sachkhere', 'საჩხერ'],
    isActive: true,
  },
  {
    id: 'rustavi',
    name: 'რუსთავი',
    lat: 41.5494,
    lng: 44.9939,
    keywords: ['rustavi', 'რუსთავ'],
    isActive: true,
  },
  {
    id: 'telavi',
    name: 'თელავი',
    lat: 41.9198,
    lng: 45.4733,
    keywords: ['telavi', 'თელავ'],
    isActive: true,
  },
  {
    id: 'gori',
    name: 'გორი',
    lat: 41.9842,
    lng: 44.1158,
    keywords: ['gori', 'გორ'],
    isActive: true,
  },
  {
    id: 'kutaisi',
    name: 'ქუთაისი',
    lat: 42.2679,
    lng: 42.6946,
    keywords: ['kutaisi', 'ქუთაის'],
    isActive: true,
  },
  {
    id: 'zugdidi',
    name: 'ზუგდიდი',
    lat: 42.5088,
    lng: 41.8709,
    keywords: ['zugdidi', 'ზუგდიდ'],
    isActive: true,
  },
  {
    id: 'akhaltsikhe',
    name: 'ახალციხე',
    lat: 41.639,
    lng: 42.9826,
    keywords: ['akhaltsikhe', 'ახალციხ'],
    isActive: true,
  },
];
