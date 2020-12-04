import React from "react";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { useLanguageProvider } from "../LanguageProvider/reducer";
import { selectLocale } from '../LanguageProvider/selector';
import { Locale } from "../LanguageProvider/types";

const options = [
  { key: 1, text: 'EN', value: "en" },
  { key: 2, text: 'FR', value: "fr" },
];

export const LanguageSwitcher = () => {

  const { locale } = useSelector(selectLocale);
  const langProvider = useLanguageProvider();
  const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    langProvider.setLocale(data.value as Locale);
  }

  return (
    <Dropdown selection compact onChange={handleChange} value={locale} options={options} />
  )
}
