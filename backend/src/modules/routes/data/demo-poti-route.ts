/**
 * Demo exam-style route for Poti — path + voice commands.
 * Coordinates approximate real streets near Poti center for simulation MVP.
 */
export const DEMO_POTI_ROUTE = {
  sourceKey: 'demo-poti-1',
  title: 'ფოთი — Demo სიმულაცია #1',
  city: 'ფოთი',
  description:
    'დემო საგამოცდო მარშრუტი სიმულაციისა და ხმოვანი ბრძანებების საჩვენებლად. გზაზე მოძრაობისას აპლიკაცია თვითონ ამბობს მითითებებს.',
  // [lng, lat]
  path: [
    [41.6712, 42.1468],
    [41.6728, 42.1476],
    [41.6745, 42.1484],
    [41.6762, 42.1491],
    [41.6778, 42.1498],
    [41.6789, 42.1506],
    [41.6795, 42.1518],
    [41.6792, 42.1532],
    [41.6784, 42.1545],
    [41.6771, 42.1556],
    [41.6754, 42.1562],
    [41.6736, 42.1565],
    [41.6718, 42.1561],
    [41.6704, 42.1552],
    [41.6695, 42.1539],
    [41.6692, 42.1524],
    [41.6698, 42.1510],
    [41.6710, 42.1498],
    [41.6718, 42.1484],
    [41.6712, 42.1468],
  ] as [number, number][],
  steps: [
    {
      order: 0,
      lat: 42.1484,
      lng: 41.6745,
      action: 'TURN_RIGHT' as const,
      distanceBeforeVoice: 120,
      voiceText: '120 მეტრში მოუხვიეთ მარჯვნივ.',
    },
    {
      order: 1,
      lat: 42.1518,
      lng: 41.6795,
      action: 'TURN_LEFT' as const,
      distanceBeforeVoice: 100,
      voiceText: '100 მეტრში მოუხვიეთ მარცხნივ.',
    },
    {
      order: 2,
      lat: 42.1556,
      lng: 41.6771,
      action: 'STOP' as const,
      distanceBeforeVoice: 80,
      voiceText: '80 მეტრში გააჩერეთ. შეამოწმეთ სარკეები.',
    },
    {
      order: 3,
      lat: 42.1561,
      lng: 41.6718,
      action: 'TURN_LEFT' as const,
      distanceBeforeVoice: 100,
      voiceText: '100 მეტრში მოუხვიეთ მარცხნივ.',
    },
    {
      order: 4,
      lat: 42.1524,
      lng: 41.6692,
      action: 'U_TURN' as const,
      distanceBeforeVoice: 90,
      voiceText: '90 მეტრში შეაბრუნეთ.',
    },
    {
      order: 5,
      lat: 42.1484,
      lng: 41.6718,
      action: 'PARKING' as const,
      distanceBeforeVoice: 80,
      voiceText: 'მოახლოვდით საწყის წერტილს. დაიწყეთ დაპარკინგება.',
    },
  ],
};
