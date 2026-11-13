// A point on the thermal gradient (0 = cold blue, 1 = hot ember) as a CSS
// color, matching --thermal in globals.css. Used to tint things by position,
// e.g. unit 1 is cool and the last unit is hot.
export function thermalAt(t) {
  const x = Math.min(1, Math.max(0, t));
  if (x <= 0.55) {
    const p = Math.round((x / 0.55) * 100);
    return `color-mix(in oklch, var(--flame-glow) ${p}%, var(--cool))`;
  }
  const p = Math.round(((x - 0.55) / 0.45) * 100);
  return `color-mix(in oklch, var(--ember) ${p}%, var(--flame-glow))`;
}
