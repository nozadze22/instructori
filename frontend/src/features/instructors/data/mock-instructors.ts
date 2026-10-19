export type InstructorCity = "tbilisi" | "rustavi" | "batumi" | "kutaisi";

export type InstructorCategoryFilter =
  | "all"
  | "b"
  | "automatic"
  | "manual"
  | "cd"
  | "vip";

export type InstructorBadgeIcon =
  | "verified"
  | "psychology"
  | "military"
  | "speed"
  | "stars"
  | "badge";

export type MockInstructor = {
  id: string;
  name: string;
  badgeIcon: InstructorBadgeIcon;
  badgeLabel: string;
  location: string;
  city: InstructorCity;
  imageUrl: string;
  imageAlt: string;
  tags: string[];
  categories: Exclude<InstructorCategoryFilter, "all">[];
  bio: string;
  experienceYears: number;
  passRate: number;
  students: number;
  rating: number;
  hourlyRate: number;
  likes: number;
};

export const MOCK_INSTRUCTORS: MockInstructor[] = [
  {
    id: "giorgi-makharadze",
    name: "გიორგი მახარაძე",
    badgeIcon: "verified",
    badgeLabel: "სერტიფიცირებული PRO",
    location: "თბილისი, რუსთავის ტრასა",
    city: "tbilisi",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWzOXKTtjvnAnExCUsv_eUo8sKZgAJ5WpgJ7tRsZpS58U_sr9gRC469kGMeh6Re7o3Hw202-tZGGk4x7MttnjXcWxFcZcqHo5p3kMnQHoI_eeIe1sOolbsiO122574TeGI9rnbwBDPjZk_r6LGizuc8TS7ot4mgD_n2Fhfo1eHm0lydevm36N2oIUjDz6LQ1FUc_4jBD1cfZOEj5TjQaAGUHBmP8C0I0QNsWcuwTNs5GVCL6Fr4taKfQ",
    imageAlt:
      "Professional portrait of a confident male driving instructor in a simulator room",
    tags: ["B კატეგორია", "მექანიკა / ავტომატიკა", "ქალაქის 1-ლი ზონა"],
    categories: ["b", "manual", "automatic"],
    bio: "რუსთავის საგამოცდო მოედნისა და რთული გზაჯვარედინების სპეციალისტი. განსაკუთრებული აქცენტი პარკირების ალგორითმებზე.",
    experienceYears: 12,
    passRate: 97,
    students: 1450,
    rating: 4.95,
    hourlyRate: 45,
    likes: 248,
  },
  {
    id: "mariam-davitashvili",
    name: "მარიამ დავითაშვილი",
    badgeIcon: "psychology",
    badgeLabel: "სტრეს-მენეჯმენტი & VIP",
    location: "თბილისი, ვაკე-საბურთალო",
    city: "tbilisi",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCcF-Y7jAmDsSeiqbrdHEffG6w2wtNclfusIqUCnlkWhuuikuqGtUekD_S8BXSo_ZxkzFNbRwBisxDx62HB3eZeg2ynSPwsTQdyO4hPczgcUAxBYlOhmDWDPz30hul6ufrC48oJfyvQFLyxCrcI6JOyqEKAtyftmKHG6-2y3qaxuTUKEkSeCcb0ZFN23FUipomVhVW2DRpRisq9rG9Jz3LLyqu6KfZA5LC_7AoJqsj7wgx7JDOmc92jmA",
    imageAlt: "Professional portrait of a Georgian female driving instructor",
    tags: ["B კატეგორია", "ავტომატიკა", "შიშის დაძლევა"],
    categories: ["b", "automatic", "vip"],
    bio: "ფსიქოლოგიური მომზადება გამოცდის წინ, საცობებში მანევრირება და ნულოვანი სტრესის ადაპტაციური მეთოდოლოგია.",
    experienceYears: 8,
    passRate: 99,
    students: 980,
    rating: 4.98,
    hourlyRate: 55,
    likes: 312,
  },
  {
    id: "levan-kapanadze",
    name: "ლევან კაპანაძე",
    badgeIcon: "military",
    badgeLabel: "15+ წლიანი ექსპერტი",
    location: "რუსთავის საგამოცდო ცენტრი",
    city: "rustavi",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAorNf7FHhvDl7KBqJ_jcdoYuirtGXIWe24jbD2k1mX0QxIvif1JolmBWtG96PS84E1wUymhGRNtDBO690K_pIBrMo6rBkgkIU0e35nua0qPJwtUgWZoV1dZRHn6a_Zv18LbdB5vwK7n1K244mNlcWJbr21lSARq9xbOYOdmw23wGi9L2vLg7tg8cJqXQVD245DroyZ3pNqj2T8z2rCAUKVqKAfwH06e27G5FjIixwP_vENLSaM1ZYvqQ",
    imageAlt: "Portrait of a focused driving instructor with glasses",
    tags: ["B & C კატეგორია", "მექანიკა", "საგამოცდო ტესტერ"],
    categories: ["b", "cd", "manual"],
    bio: "ყოფილ გამომცდელთა საბჭოს წევრი. დეტალური ანალიზი ყველა ტიპურ შეცდომაზე და მარშრუტის რთულ წერტილებზე.",
    experienceYears: 16,
    passRate: 96,
    students: 2100,
    rating: 4.93,
    hourlyRate: 50,
    likes: 418,
  },
  {
    id: "davit-gelashvili",
    name: "დავით გელაშვილი",
    badgeIcon: "speed",
    badgeLabel: "ექსტრემალური მართვა",
    location: "ბათუმი, ცენტრალური ტრასა",
    city: "batumi",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAO8IhRwAx0zvZQ4XSp5YKwOF0XiMVfoRb-5GS4IlPDJ435--_jBi6Aa8laQDp_phCzlzL_agT31FRLkEPciTO3qop5X76escZkIL2e1YlVXPM4JK511yBz451AhRIjM4CEwTkt8rg48bEmwOz7nns-MmWgR2DttJcKDxin3hdMggFaJgYZhON7FSFsimMMkpZzozxPFuheTN4X64ZX7XaWPKgmlXMw8yW9KiIYFV238UHAl01Xh_KzVA",
    imageAlt: "Young professional driving mentor in a modern studio",
    tags: ["B კატეგორია", "ავტომატიკა", "ცუდ ამინდში მართვა"],
    categories: ["b", "automatic"],
    bio: "სველი ასფალტის სიმულაციები, დამცავი მართვის ტექნიკა და საგამოცდო ელემენტების სწრაფი ათვისება.",
    experienceYears: 7,
    passRate: 94,
    students: 720,
    rating: 4.89,
    hourlyRate: 40,
    likes: 194,
  },
  {
    id: "salome-tsereteli",
    name: "სალომე წერეთელი",
    badgeIcon: "stars",
    badgeLabel: "ტოპ რეიტინგი",
    location: "თბილისი, დიღომი & ისანი",
    city: "tbilisi",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5-9nxtRiUO6AfqIZ4PUidoFnyUuSKhviRfnbapwbMi9xPE9Bp6Fim8HUPwOE6JWuIAcc708UAefPbVtXwdm3-xn8nzMeOT2fHE_FzGtleGvQPjMrAcTI8PM-Is5aIDlbRBTvDWpXIf34RD1biPgLeugpY7gMqHX5Q9ah10q6TuOVCaeE5IIUrTUxtjssYjvsLYsIWdE1nlukSa0pDMKfSVfrFGaoz_EpobtE9Zlt_WNHBIjZIFNCw6Q",
    imageAlt: "Portrait of a smart female driving coach",
    tags: ["B კატეგორია", "მექანიკა", "საგამოცდო GPS ტრასა"],
    categories: ["b", "manual"],
    bio: "ნაბიჯ-ნაბიჯ მეთოდოლოგია პირველივე ცდაზე ჩასაბარებლად. ტელემეტრიული ანალიზი ყოველი სესიის შემდგომ.",
    experienceYears: 9,
    passRate: 98,
    students: 1180,
    rating: 4.97,
    hourlyRate: 45,
    likes: 287,
  },
  {
    id: "irakli-chkheidze",
    name: "ირაკლი ჩხეიძე",
    badgeIcon: "badge",
    badgeLabel: "საგამოცდო მენტორი",
    location: "ქუთაისი, ცენტრალური მოედანი",
    city: "kutaisi",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWYlULupTCSvk-5gagI57_uxwrYR5b69j-e_j50C6VNe5g0zx5c0UxbjgjeDUu5CF-iP661eq_8r88ORXx3boenQRYiKrZikE6P0I1HypqQ7-67a6LEmw9fd9T_35klnnXbwtsQCq0W0DJgMpKQnYZjuzD3YMWatWpACbdphmOZGGq3hFE9uuK45Kb-wjiThQMAnS_4hO9p_eMyQpjPDEgj1ZyqajYqF70OOV4h7WtEIrNhxGApBi3uw",
    imageAlt: "Portrait of an experienced senior driving coach",
    tags: ["B / C კატეგორია", "მექანიკა", "ინდივიდუალური გრაფიკი"],
    categories: ["b", "cd", "manual"],
    bio: "ქუთაისის საგამოცდო ტრასის ყველა ნიუანსი და წესი. ტექნიკური ელემენტების მარტივი და მყარი განმარტება.",
    experienceYears: 14,
    passRate: 93,
    students: 1320,
    rating: 4.91,
    hourlyRate: 40,
    likes: 165,
  },
];

export const INSTRUCTOR_CITY_OPTIONS: Array<{
  value: "all" | InstructorCity;
  label: string;
}> = [
  { value: "all", label: "ყველა ქალაქი (თბილისი, რუსთავი...)" },
  { value: "tbilisi", label: "თბილისი (საბურთალო, დიღომი, ისანი)" },
  { value: "rustavi", label: "რუსთავი (საგამოცდო დეპარტამენტი)" },
  { value: "batumi", label: "ბათუმი" },
  { value: "kutaisi", label: "ქუთაისი" },
];

export const CATEGORY_FILTERS: Array<{
  value: InstructorCategoryFilter;
  label: string;
}> = [
  { value: "all", label: "ყველა კატეგორია" },
  { value: "b", label: "B კატეგორია" },
  { value: "automatic", label: "ავტომატიკა" },
  { value: "manual", label: "მექანიკა" },
  { value: "cd", label: "C / D კატეგორია" },
  { value: "vip", label: "VIP ექსპერტი" },
];
