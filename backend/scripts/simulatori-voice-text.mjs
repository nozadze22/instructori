/** Shared simulatori.ge event kind → Georgian voice text. */

export function voiceFromKind(kind) {
  const k = String(kind ?? '');
  if (!k) return null;

  const isSoon = k.includes('soon') && !k.includes('300m');
  const prefix = k.includes('300m')
    ? '300 მეტრში '
    : isSoon
      ? 'მალე '
      : '';
  const roundaboutPlace = isSoon
    ? 'წრიული მოძრაობაზე'
    : 'წრიულ გზაჯვარედინზე';

  if (k.includes('move-straight')) {
    return 'შემდეგ მინიშნებამდე გთხოვთ იმოძრაოთ პირდაპირ';
  }
  if (k.includes('roundabout-straight')) {
    return `${prefix}${roundaboutPlace} გაიარეთ პირდაპირ.`;
  }
  if (k.includes('roundabout-left-left')) {
    return `${prefix}${roundaboutPlace} მოუხვიეთ მარცხნივ და კიდევ მარცხნივ.`;
  }
  if (k.includes('roundabout-left')) {
    return `${prefix}${roundaboutPlace} მოუხვიეთ მარცხნივ.`;
  }
  if (k.includes('roundabout-right')) {
    return `${prefix}${roundaboutPlace} მოუხვიეთ მარჯვნივ.`;
  }
  if (k.includes('turn-left-left')) {
    return `${prefix}მოუხვიეთ მარცხნივ და კიდევ მარცხნივ.`;
  }
  if (k.includes('turn-left')) {
    return `${prefix}მოუხვიეთ მარცხნივ.`;
  }
  if (k.includes('turn-right')) {
    return `${prefix}მოუხვიეთ მარჯვნივ.`;
  }

  return null;
}

export const SOON_ROUNDABOUT_VOICE_FROM = "მალე წრიულ გზაჯვარედინზე";
export const SOON_ROUNDABOUT_VOICE_TO = "მალე წრიული მოძრაობაზე";
