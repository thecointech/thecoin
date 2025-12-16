
import React from 'react';
import { Link as LinkRouter, LinkProps, NavLink as NavLinkRouter, NavLinkProps } from 'react-router';
export type { NavLinkProps, LinkProps }

export const NavLink = (props: NavLinkProps) => (
  <NavLinkRouter {...props} viewTransition />
);

export const Link = (props: LinkProps) => (
  <LinkRouter {...props} viewTransition />
);
