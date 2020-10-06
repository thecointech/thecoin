import React, { useState } from "react";
import _ from "lodash";
import { Dropdown } from "semantic-ui-react";
import { useLanguageProvider } from "containers/LanguageProvider/reducer";
import { DEFAULT_LOCALE } from '../../i18n';

const options = [
  { key: 1, text: 'EN', value: "en" },
  { key: 2, text: 'FR', value: "fr" },
];

const LanguageSwitcher = () => {
    
    const [ locale, setLocale ] =  useState<string>(DEFAULT_LOCALE);
    const handleChange = (e: any, { value }: any) => {
      setLocale({value}.value)
    }
    useLanguageProvider().setLocale(locale);

    return (
        <Dropdown selection compact onChange={handleChange} value={locale} options={options} />            
    )
  }
  
  export default LanguageSwitcher;