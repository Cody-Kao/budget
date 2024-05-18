import * as React from 'react';
import { LinkProps as NextLinkProps } from 'next/link';
import { LinkProps as MuiLinkProps } from '@mui/material/Link';
interface NextLinkComposedProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>, Omit<NextLinkProps, 'href' | 'as' | 'passHref' | 'onMouseEnter' | 'onClick' | 'onTouchStart'> {
    to: NextLinkProps['href'];
    linkAs?: NextLinkProps['as'];
}
export type LinkProps = {
    activeClassName?: string;
    as?: NextLinkProps['as'];
    href: NextLinkProps['href'];
    linkAs?: NextLinkProps['as'];
    noLinkStyle?: boolean;
} & Omit<NextLinkComposedProps, 'to' | 'linkAs' | 'href'> & Omit<MuiLinkProps, 'href'>;
export declare const Link: React.ForwardRefExoticComponent<Omit<LinkProps, "ref"> & React.RefAttributes<HTMLAnchorElement>>;
export {};
