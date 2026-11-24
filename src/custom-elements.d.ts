import * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-details-compact': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        orientation?: 'horizontal' | 'vertical';
        'truncation-preferred'?: boolean | string;
        'internal-usage-attribution-ids'?: string;
      };
      'gmp-place-details-place-request': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        place?: string | null;
      };
      'gmp-place-content-config': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
