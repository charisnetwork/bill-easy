// GST slabs from 22 Sep 2025: 5%, 18% and 40% (plus nil). 12% and 28% were removed, but a
// product, invoice or quotation saved earlier keeps its rate, so that rate stays in the list.
export const GST_RATES = [0, 5, 18, 40];

/** The Select value for a stored rate ("18.00" -> "18"). */
export const gstRateValue = (rate) => String(Number(rate) || 0);

/** Rates to offer: the current slabs, plus the record's own rate when it is an older one. */
export function gstRateOptions(current) {
  const value = Number(current) || 0;
  return (GST_RATES.includes(value) ? GST_RATES : [...GST_RATES, value].sort((a, b) => a - b)).map(String);
}
