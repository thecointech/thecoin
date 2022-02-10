import React, { useCallback } from "react";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { LanguageProviderReducer } from "@thecointech/shared/containers/LanguageProvider/reducer";
import { selectLocale } from '@thecointech/shared/containers/LanguageProvider/selector';
import { Locale } from "@thecointech/shared/containers/LanguageProvider/types";
import styles from './styles.module.less';

const options = [
  { key: 1, text: 'EN', value: "en" },
  { key: 2, text: 'FR', value: "fr" },
];

export const LanguageSwitcher = () => {

  const { locale } = useSelector(selectLocale);
  const langProvider = LanguageProviderReducer.useApi();
  const handleChange = useCallback((_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    langProvider.setLocale(data.value as Locale);
  }, [langProvider]);

  return (
    <Dropdown id={styles.switcherMenu} selection compact onChange={handleChange} value={locale} options={options} />
  )
}
