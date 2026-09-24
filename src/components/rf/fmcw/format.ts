/** Value and unit kept apart so readouts can set the unit smaller. */
export type Quantity = [value: string, unit: string];

export function hz(value: number): Quantity {
  if (value >= 1e9) return [(value / 1e9).toFixed(2), 'GHz'];
  if (value >= 1e6) return [(value / 1e6).toFixed(2), 'MHz'];
  if (value >= 1e3) return [(value / 1e3).toFixed(1), 'kHz'];
  return [value.toFixed(0), 'Hz'];
}

export function seconds(value: number): Quantity {
  if (value >= 1e-3) return [(value * 1e3).toFixed(2), 'ms'];
  if (value >= 1e-6) return [(value * 1e6).toFixed(2), 'µs'];
  return [(value * 1e9).toFixed(1), 'ns'];
}

export function metres(value: number): Quantity {
  if (value < 1) return [(value * 100).toFixed(2), 'cm'];
  return [value.toFixed(2), 'm'];
}

export const joined = ([value, unit]: Quantity) => `${value} ${unit}`;
