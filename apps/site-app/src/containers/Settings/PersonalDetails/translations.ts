import type { AccountKYCUser, AccountKYCAddress, AccountKYCPhone } from '@thecointech/account';
import { defineMessages } from 'react-intl';

type editableTypes =keyof (AccountKYCUser&AccountKYCAddress&AccountKYCPhone);

export const detailStrings = defineMessages<editableTypes>({

  given_name: {
    defaultMessage: 'Given Name',
    description: 'app.settings.personaldetails.name: Name field for the page setting / tab personal details in the app',
  },
  family_name: {
    defaultMessage: 'Family Name',
    description: 'app.settings.personaldetails.familyname: Name field for the page setting / tab personal details in the app',
  },
  email: {
    defaultMessage: 'Email',
    description: 'app.settings.personaldetails.email: Email field for the page setting / tab personal details in the app',
  },
  DOB: {
    defaultMessage: 'Date of Birth',
    description: 'app.settings.personaldetails.dob: Date of birth field for the page setting / tab personal details in the app',
  },
  phoneNumber: {
    defaultMessage: 'Phone Number',
    description: 'app.settings.personaldetails.phone: Phone field for the page setting / tab personal details in the app',
  },
  // NOTE: PHONE NOT YET INTEGRATED
  number: {
    defaultMessage: 'Phone Number',
    description: 'app.settings.personaldetails.phone: Phone field for the page setting / tab personal details in the app',
  },
  countryCode: {
    defaultMessage: 'Phone Number',
    description: 'app.settings.personaldetails.phone: Phone field for the page setting / tab personal details in the app',
  },
  countryCode2: {
    defaultMessage: 'Phone Number',
    description: 'app.settings.personaldetails.phone: Phone field for the page setting / tab personal details in the app',
  },
  // ------------------------------------------------
  country: {
    defaultMessage: 'Country',
    description: 'app.settings.personaldetails.country: Country Adress field for the page setting / tab personal details in the app',
  },
  state: {
    defaultMessage: 'State',
    description: 'app.settings.personaldetails.state: State field for the page setting / tab personal details in the app',
  },
  address: {
    defaultMessage: 'Address',
    description: 'app.settings.personaldetails.address: Address field for the page setting / tab personal details in the app',
  },
  extraInfo: {
    defaultMessage: 'Suite/Appt/Box #',
    description: 'app.settings.personaldetails.address: Address field for the page setting / tab personal details in the app',
  },
  postalCode: {
    defaultMessage: 'Postal Code',
    description: 'app.settings.personaldetails.postalcode: Postal Code Address field for the page setting / tab personal details in the app',
  },
  city: {
    defaultMessage: 'City',
    description: 'app.settings.personaldetails.city: City Address field for the page setting / tab personal details in the app',
  },
});
