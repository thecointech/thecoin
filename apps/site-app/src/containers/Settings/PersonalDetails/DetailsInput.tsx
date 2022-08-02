import React, { useEffect, useState } from 'react';
import { UxInput, ValidateCB, BaseProps } from '@thecointech/shared/components/UX';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Icon } from 'semantic-ui-react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import styles from './styles.module.less';
import { detailStrings } from './translations';

type Props<T extends "user"|"address"|"phone"> = {

  dataType: T;
  property: keyof typeof detailStrings;
  // className?: string;
  // defaultValue?: string;
  // details: AccountKYC;
  onValidate?: ValidateCB,

  // translation: MessageDescriptor;
  InputType?: React.FC<any>;
} & Partial<BaseProps>;

const noValidation = () => null;

const editString = defineMessage({
  defaultMessage: 'Edit',
  description: 'app.settings.personaldetails.edit: Edit zone for the page setting / tab personal details in the app',
})

export const DetailsInput = <T extends "user"|"address"|"phone">(
  { dataType, property, onValidate, InputType=UxInput, ...rest }: Props<T>
) => {
  const [readOnly, setReadOnly] = useState(true);
  const account = AccountMap.useActive()!;

  // Every time account.details changes, reset our state back to readOnly
  useEffect(() => {
    setReadOnly(true);
  }, [account.details]);

  const translation = detailStrings[property];
  const kyc = account.details[dataType];
  const defaultValue = (kyc as any)?.[property];
  return (
    <InputType
      intlLabel={< div >
        <FormattedMessage {...translation} />
        <span onClick={() => setReadOnly(!readOnly)} className={styles.edit}>
          <Icon name={"edit"} /><FormattedMessage {...editString} />
        </span>
      </div >}
      onValidate={onValidate ?? noValidation}
      placeholder={translation}
      tooltip={translation}
      defaultValue={defaultValue}
      name={property}
      readOnly={readOnly}
      {...rest}
    />
  );
}


export const UserDetailsInput = (props: Omit<Props<"user">, "dataType">) => <DetailsInput {...props} dataType="user" />;
export const UserAddressInput = (props: Omit<Props<"address">, "dataType">) => <DetailsInput {...props} dataType="address" />;
export const UserPhoneInput = (props: Omit<Props<"phone">, "dataType">) => <DetailsInput {...props} dataType="phone" />;
