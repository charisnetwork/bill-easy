import { Country, State } from 'country-state-city';

export const COUNTRIES = Country.getAllCountries().map((country) => ({
  code: country.isoCode,
  name: country.name,
  currency: country.currency || 'USD',
  locale: country.isoCode === 'IN' ? 'en-IN' : 'en',
  postalLabel: country.isoCode === 'IN' ? 'PIN code' : 'Postal code'
}));

export const countryByCode = (code) => COUNTRIES.find((country) => country.code === code) || COUNTRIES.find((country) => country.code === 'IN');
export const regionsForCountry = (code) => State.getStatesOfCountry(code).map((state) => state.name);
export const validPostalCode = (countryCode, value) => {
  if (!value) return true;
  if (countryCode === 'IN') return /^\d{6}$/.test(String(value).trim());
  return /^[A-Za-z0-9 -]{3,12}$/.test(String(value).trim());
};
