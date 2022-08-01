import React, { useEffect, useState } from 'react';
import { BaseProps } from '@thecointech/shared/components/UX';
import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl';
import { Icon } from 'semantic-ui-react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import type { AccountDetails } from '@thecointech/account';
import styles from './styles.module.less';

type Props = {
  // className?: string;
  editting: keyof AccountDetails,
  // onValue: (value?: string, name?: string) => void,
  // onValidate?: ValidateCB,

  translation: MessageDescriptor;
  Input: React.FC<any>;
} & Partial<BaseProps>;

const noValidation = () => null;

const editString = defineMessage({
  defaultMessage: 'Edit',
  description: 'app.settings.personaldetails.edit: Edit zone for the page setting / tab personal details in the app',
})

export const DetailsInput = (props: Props) => {
  const [readOnly, setReadOnly] = useState(false);
  const account = AccountMap.useActive()!;

  // Every time account.details changes, reset our state back to readOnly
  useEffect(() => {
    setReadOnly(false);
  }, [account.details]);

  const { editting, Input, onValidate, translation, ...rest } = props;
  return (
    <Input
      intlLabel={< div >
        <FormattedMessage {...props.translation} />
        <span onClick={() => setReadOnly(!readOnly)} className={styles.edit}>
          <Icon name={"edit"} /><FormattedMessage {...editString} />
        </span>
      </div >}
      onValidate={onValidate ?? noValidation}
      placeholder={props.translation}
      tooltip={props.translation}
      defaultValue={account.details[props.editting] as string}
      name={props.editting}
      readOnly={readOnly}
      {...rest}
    />
  );
}
