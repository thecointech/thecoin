import React from "react";
import { Dropdown } from "semantic-ui-react";
import _ from "lodash";
import { useLanguageProvider } from "containers/LanguageProvider/reducer";

const getOptions = (id: number, prefix = 'Choice ') =>
  _.times(id, (index) => ({
    key: index,
    text: `${prefix}${index}`,
    value: index,
  }));



class LanguageSwitcher extends React.Component {


    render() {
      return (
        <Dropdown selection compact onChange={useLanguageProvider}>            
            <Dropdown.Menu>
                <Dropdown.Item key="0" index="EN" text='EN' options={getOptions(0, 'EN')} />
                <Dropdown.Item key="1" index="FR" text='FR' options={getOptions(1, 'FR')}/>
            </Dropdown.Menu>
        </Dropdown>
      );
    }
  }
  
  export default LanguageSwitcher;