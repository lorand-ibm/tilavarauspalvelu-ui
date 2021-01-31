import { isAfter, parseISO, isBefore, format } from 'date-fns';
import { Parameter, TranslationObject } from './types';

// eslint-disable-next-line import/prefer-default-export
export const isActive = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  return isAfter(now, parseISO(startDate)) && isBefore(now, parseISO(endDate));
};

export const formatDate = (date: string): string => {
  if (!date) {
    return 'undefined || null';
  }
  return format(parseISO(date), 'd. M. yyyy');
};

export const formatApiDate = (date: string): string => {
  if (!date) {
    return 'undefined || null';
  }
  return format(parseISO(date), 'yyyy-MM-dd');
};

// for Selector
export type OptionType = {
  label: string;
  value?: number;
};

export const getLabel = (parameter: Parameter, lang = 'fi'): string => {
  if (parameter.name) {
    if (typeof parameter.name === 'string') {
      return parameter.name;
    }
    return parameter.name[lang];
  }
  if (parameter.minimum && parameter.maximum) {
    return `${parameter.minimum} - ${parameter.maximum}`;
  }
  return 'no label';
};

const emptyOption = (label: string) =>
  ({ label, value: undefined } as OptionType);

export const localizedValue = (
  name: string | TranslationObject | undefined,
  lang: string
): string => {
  if (!name) {
    return '???';
  }
  // needed until api stabilizes
  if (typeof name === 'string') {
    return name;
  }
  return name[lang] || name.fi || name.en || name.sv;
};

export const mapOptions = (
  src: Parameter[],
  emptyOptionLabel?: string,
  lang = 'fi'
): OptionType[] => {
  const r = (<OptionType[]>[])
    .concat(emptyOptionLabel ? [emptyOption(emptyOptionLabel)] : [])
    .concat(
      src.map((v) => ({
        label: localizedValue(v.name, lang),
        value: v.id,
      }))
    );
  return r;
};

export const getSelectedOption = (
  selectedId: number | null,
  options: OptionType[]
): OptionType | undefined => {
  const selected = Number(selectedId);
  const option = options.find((o) => o.value === selected);
  return option;
};
