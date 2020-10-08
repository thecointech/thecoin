import React from "react";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { useLanguageProvider } from "containers/LanguageProvider/reducer";
import { selectLocale } from 'containers/LanguageProvider/selector';
import { useSelector } from "react-redux";

const options = [
  { key: 1, text: 'EN', value: "en" },
  { key: 2, text: 'FR', value: "fr" },
];

const LanguageSwitcher = () => {
    
    const { locale } = useSelector(selectLocale);
    const langProvider = useLanguageProvider();
    const handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
      langProvider.setLocale( data.value as string );
    }

    return (
        <Dropdown selection compact onChange={handleChange} value={locale} options={options} />            
    )
  }
  
  export default LanguageSwitcher;