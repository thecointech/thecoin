import * as React from 'react';

import { Switch, Route } from 'react-router-dom';
import * as Sidebar from '@the-coin/components/containers/PageSidebar/actions';
import { SidebarMenuElement } from '@the-coin/components/containers/PageSidebar/types';
import { connect } from 'react-redux';

import { UploadWallet } from '@the-coin/components/containers/UploadWallet';
import AccountCreate from './Create/index';

type MyProps = {
  url: string;
  createLink: SidebarMenuElement;
};
type Props = MyProps & Sidebar.DispatchProps;
class NewAccountClass extends React.PureComponent<Props, {}, null> {
  componentDidMount() {
    const { createLink } = this.props;
    this.props.setSubItems(createLink.link.name, createLink.subItems!);
  }

  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = function(e) {
        var target: any = e.target;
        var data = target.result;
        resolve(data);
      };
      reader.readAsText(file);
    });
  }

  render() {
    const { url } = this.props;
    return (
      <Switch>
        <Route
          path={`${url}/upload`}
          render={state => <UploadWallet readFile={this.readFile} />}
        />
        <Route component={AccountCreate} />
      </Switch>
    );
  }
}

const NewAccount = connect(null, Sidebar.mapDispatchToProps)(NewAccountClass);

export { NewAccount };
