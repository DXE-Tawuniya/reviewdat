import type * as React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'md' | 'sm'; block?: boolean }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; helperText?: string; error?: string; multiline?: boolean }
export declare function TextField(props: TextFieldProps): React.ReactElement;
export interface CardProps { title?: string; meta?: React.ReactNode; badge?: React.ReactNode; children?: React.ReactNode; className?: string }
export declare function Card(props: CardProps): React.ReactElement;
export interface BadgeProps { tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'; children?: React.ReactNode }
export declare function Badge(props: BadgeProps): React.ReactElement;
export interface RatingProps { value: number; max?: number; showValue?: boolean; onChange?: (value: number) => void }
export declare function Rating(props: RatingProps): React.ReactElement;
export interface TabsProps { items: { value: string; label: string }[]; value?: string; onChange?: (value: string) => void }
export declare function Tabs(props: TabsProps): React.ReactElement;
export interface AlertProps { tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string; children?: React.ReactNode }
export declare function Alert(props: AlertProps): React.ReactElement;
declare global { interface Window { Reviewdat: { Button: typeof Button; TextField: typeof TextField; Card: typeof Card; Badge: typeof Badge; Rating: typeof Rating; Tabs: typeof Tabs; Alert: typeof Alert } } }
