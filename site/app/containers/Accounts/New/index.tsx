import * as React from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';

import * as Sidebar from '@the-coin/components/containers/PageSidebar/actions';
import { UploadWallet } from '@the-coin/components/containers/UploadWallet';
import { Connect } from './Connect';
import { Restore } from './Restore';
import { Returning } from '../Returning';
import { Create } from './Wizard/Create';
import { CreateExistingSwitch } from './CreateExistingSwitch';

interface MyProps {
  url: string;
}
type Props = MyProps & Sidebar.DispatchProps;

const NewAccountName = 'Add Account';

// const ConstantSidebarItems: SidebarMenuItem[] = [
//   {
//     link: {
//       to: 'generate',
//       name: 'Create Account',
//     },
//   },
//   {
//     link: {
//       to: 'upload',
//       name: 'Upload Account',
//     },
//   },
//   {
//     link: {
//       to: 'connect',
//       name: 'Connect to Web3',
//     },
//   },
//   {
//     link: {
//       to: 'restore',
//       name: 'Restore',
//     },
//   }
// ];

class NewAccountClass extends React.PureComponent<Props> {

  // constructor(props: Props) {
  //   super(props);

  //   this.generateSubItems = this.generateSubItems.bind(this);
  // }

  // public generateSubItems(items: SidebarMenuItem[], state: ApplicationBaseState): SidebarMenuItem[] {
  //   const {url} = this.props;
  //   const item = FindItem(items, NewAccountName);
  //   if (item) {
  //     item.subItems = MapMenuItems(ConstantSidebarItems, url);
  //   }
  //   return items;
  // }

  // public componentDidMount() {
  //   this.props.addGenerator(NewAccountName, this.generateSubItems);
  // }
  // public componentWillUnmount() {
  //   this.props.removeGenerator(NewAccountName);
  // }

  public readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const target: any = e.target;
        const data = target.result;
        resolve(data);
      };
      reader.readAsText(file);
    });
  }

  private renderUploadWallet = () => <UploadWallet readFile={this.readFile} />;

  public render() {
    const { url } = this.props;
    return (
      <Switch>
        <Route path={`${url}/upload`} render={this.renderUploadWallet} />
        <Route path={`${url}/create`} component={Create} />
        <Route path={`${url}/connect`} component={Connect} />
        <Route path={`${url}/restore`} component={Restore} />
        <Route path={`${url}/returning`} component={Returning} />
        <Route render={() => <CreateExistingSwitch url={url} />}/>
      </Switch>
    );
  }
}

const NewAccount = connect(null, Sidebar.mapDispatchToProps)(NewAccountClass);

export { NewAccount, NewAccountName };
