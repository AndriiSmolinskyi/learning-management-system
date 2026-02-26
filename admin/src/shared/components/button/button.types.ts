import type React from 'react'

export enum Size {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum Color {
	MAIN_COLOR = 'mainColor',
}

export enum ButtonType {
  TEXT = 'text',
  ICON = 'icon',
}

export type ButtonProps<T extends ButtonType> = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  disabled?: boolean;
  additionalProps: T extends ButtonType.TEXT
    ? {
        btnType: ButtonType.TEXT;
        text: string;
        size?: Size;
        color?: Color;
        leftIcon?: React.ReactNode;
        rightIcon?: React.ReactNode;
      }
    : T extends ButtonType.ICON
    ? {
        btnType: ButtonType.ICON;
        icon: React.ReactNode;
        size?: Size;
        color?: Color;
        leftIcon?: React.ReactNode;
        rightIcon?: React.ReactNode;
      }
    : never;
};
