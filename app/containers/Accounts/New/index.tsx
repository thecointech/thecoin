import * as React from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';

import * as Sidebar from '@the-coin/components/containers/PageSidebar/actions';
import { SidebarMenuItem, FindItem, MapMenuItems } from '@the-coin/components/containers/PageSidebar/types';
import { UploadWallet } from '@the-coin/components/containers/UploadWallet';
import { ApplicationBaseState } from '@the-coin/components/types';
import { Wizard } from './Wizard'
import { Create } from './Create';
import { Connect } from './Connect';
import { Restore } from './Restore';

type MyProps = {
  url: string
};
type Props = MyProps & Sidebar.DispatchProps;

const NewAccountName = "New Account";

const ConstantSidebarItems: SidebarMenuItem[] = [
  {
    link: {
      to: 'create',
      name: 'Create Account',
    },
  },
  {
    link: {
      to: 'upload',
      name: 'Upload Account',
    },
  },
  {
    link: {
      to: 'connect',
      name: 'Connect to Web3',
    },
  },
  {
    link: {
      to: 'restore',
      name: 'Restore from Google',
    },
  },
];

class NewAccountClass extends React.PureComponent<Props> {

  constructor(props: Props) {
    super(props);

    this.generateSubItems = this.generateSubItems.bind(this);
  }

  generateSubItems(items: SidebarMenuItem[], state: ApplicationBaseState): SidebarMenuItem[] {
    const {url} = this.props;
    const item = FindItem(items, NewAccountName);
    if (item)
      item.subItems = MapMenuItems(ConstantSidebarItems, url);
    return items;
  }
  
  componentDidMount() {
    this.props.addGenerator(NewAccountName, this.generateSubItems);
  }
  componentWillUnmount() {
    this.props.removeGenerator(NewAccountName);
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
          render={_ => <UploadWallet readFile={this.readFile} />}
        />
        <Route path={`${url}/connect`} component={Connect} />
        <Route path={`${url}/restore`} component={Restore} />
        <Route path={`${url}/create`} component={Create} />
        <Route component={Wizard} />
      </Switch>
    );
  }
}

const NewAccount = connect(null, Sidebar.mapDispatchToProps)(NewAccountClass);

export { NewAccount, NewAccountName };
