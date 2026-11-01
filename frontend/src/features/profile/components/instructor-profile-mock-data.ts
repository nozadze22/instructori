/** Static showcase content until booking, fleet, reviews APIs exist. */

export const MOCK_TAGLINE =
  "უმაღლესი კატეგორიის ექსპერტ-ინსტრუქტორი • საგამოცდო მარშრუტების სპეციალისტი";

export const MOCK_BIO = `მოგესალმებით! ვარ სერტიფიცირებული Master-ინსტრუქტორი. ვამზადებ მძღოლებს როგორც პირველივე ცდაზე გამოცდის უშეცდომოდ ჩასაბარებლად, ისე რეალურ ქალაქის რთულ პირობებში თავდაჯერებული და უსაფრთხო გადაადგილებისთვის. ჩემი სპეციალიზაციაა საგამოცდო სტრესის დაძლევა, მოედნის ელემენტების დეტალური დამუშავება და ქალაქის ინტენსიური მოძრაობა.`;

export const MOCK_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCk-kub5hoy6I2I1BD8owtc1BqIeLBdbt6-1WADPtPLJUAY7gbG2ihVi7YtnkyVh3tjbPOzyZZiZz-Q2aNWWlE9Fn5Ox-iOduj-8N6jO7x0-aEiQRZVSAcnYZdLgbkz1J4TrxIQL-WuiI7mu3atub_z9shI1jpMMypRKM6oIpQRBBfX0uVwHy4zzgguLWPolvgTPkbGkacal5OuQ70vroB7sCDpevd6wCR1R__YK3IS2IXOknB-clpuwg";

export const MOCK_MAP_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjB53DFo_VSpEx5cgImoMPtGAUoYd59o8r50bQyfn6qT5bR6ejDBk8YrIu2dtN9HdZFDxG6260vVdSNrYENZ7Z_kM9CDowItM_bqiYYQBu2r81syEcKbCHyRLgM5LmJT9hZ6AyOQRgbVvpm8KK7eLWZZ_OIdEygQfBnG1KzxjdLhRQFRhTneuuRFLzNb1ZYJp7-X3rsoo3XVfZzk7bekcQ4coHiKFVkpxAmMTjvrVbzxr6guG_JhHq6A";

export const MOCK_FLEET = [
  {
    title: "Skoda Fabia (2023)",
    tag: "მექანიკა",
    sub: "საგამოცდო ანალოგი",
    desc: "ზუსტად ის მოდელი, რაც საგამოცდო მოედანზეა. აღჭურვილია დუბლირებული პედლებითა და კამერებით.",
    meta: "1.0 TSI • 5 სიჩქარე",
    status: "იდეალური კონდიცია",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpO7-NdFKvvtyy5igkRD6e9VDh-IT2AKRBw_-VkN8YKxpdDAyFy07HGDhFIerUVB4S5r7hzeS4fnzv8akad6x0am5DrDPukCphhe07KrnAUCMeLRcQGJ_r_wiVL-tGGWf0MU40RcKzWqF5wElRgPNQs6JYLWypPPsAAYVpz6g0SlROw_vUr6lBa_Y_qhGsZ0iLsb4v1p68mdFW-pkdbWdEyhacV8zHpKtuUm2T__F9VlBzOskiTdUyBw",
  },
  {
    title: "Toyota Yaris Hybrid (2022)",
    tag: "ავტომატიკა",
    tagSecondary: true,
    sub: "ქალაქის მართვა",
    desc: "ავტომატური კოლოფი B კატეგორიისთვის. რბილი მართვა და პარკინგ-კონტროლი.",
    meta: "E-CVT ავტომატიკა",
    status: "ჰიბრიდი • ეკო",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAm_x367SGREzXIPHlPD4qHzT5vi1Yf4uJdxFEGgIYi0AonSl291BEU1DhWHTjRclvXNdJdB8O9tjNACo5rn-2L89mWnu049YFHhsBmLb7HHz3O83mCnE3uYto7Eqcs4Ofe2h0V8vWsEZtAxy6Ui1wlNhCwq0bu90nzbhpa-A_IEIK5zilv1Hj5ttEYzwcNsl_y4PhVjNJV5Mp1CVaIvlDboSj6cxg6Oh3yOaQPqbMUmVE5bmmWluEtHQ",
  },
  {
    title: "SimDrive Pro Digital Twin",
    tag: "SimDrive RIG",
    sub: "1:1 Digital Twin",
    subPrimary: true,
    desc: "3-ეკრანიანი 180° სისტემა, ჰიდრავლიკური გადაბმულობა და მოედნის ციფრული ასლი.",
    meta: "Direct Drive 25Nm",
    status: "144 Hz G-Sync",
    statusPrimary: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD7vU6_1O_9hr5Qe--Vnz-Ubu5eSpJjFtlUjqubt5Bt9pKehMNSjUcC49AyAi-MXvj2V_R3HJUc8yO6yGQjwhbUjukn4RgTNHNYfxy188OB3GEb0ZIe_dAwK9CeJruFQet6DRG0cQQMpzEuV7vNBMXksfgqNQKi7u1KobhrctHjzho4rxN_OAnadjPHWXpUrVXb-h-Fl3Y4V_tt91cc3y6vfxh57kNesVmVWxVSM16RwYImRWHOotjR_A",
  },
] as const;
