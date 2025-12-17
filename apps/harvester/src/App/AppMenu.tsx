
import { Menu } from 'semantic-ui-react'
import { Link } from 'react-router'
import type { Location } from 'history'

export const AppMenu = ({location}: {location: Location}) => (
  <Menu pointing secondary vertical>
    <Menu.Item
      name='Welcome'
      active={location.pathname === '/'}
      as={Link}
      to='/'
    />
    <Menu.Item
      name='Get Started'
      active={location.pathname.startsWith('/browser')}
      as={Link}
      to='/browser'
    />
    <Menu.Item
      name='Connect TheCoin Account'
      active={location.pathname.startsWith('/account')}
      as={Link}
      to='/account'
    />
    <Menu.Item
      name='Connect Bank Account'
      active={location.pathname.startsWith('/agent')}
      as={Link}
      to='/agent'
    />
    {/*
   <Menu.Item
    name='Training'
    active={location.pathname.startsWith('/train')}
    as={Link}
    to='/train'
  /> */}
    <Menu.Item
      name='Transfer Settings'
      active={location.pathname.startsWith('/config')}
      as={Link}
      to='/config'
    />
    <Menu.Item
      name='My Dashboard'
      active={location.pathname.startsWith('/results')}
      as={Link}
      to='/results'
    />
    <Menu.Item
      name='Advanced Settings'
      active={location.pathname.startsWith('/advanced')}
      as={Link}
      to='/advanced'
    />
  </Menu>
)
