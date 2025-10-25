
import React from 'react';

interface IconProps {
    className?: string;
}

export const NewMoonIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 1.5a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Z" clipRule="evenodd" />
    </svg>
);

export const FirstQuarterIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.25a9.75 9.75 0 1 1 0 19.5.75.75 0 0 1 0-1.5A8.25 8.25 0 0 0 12 3.75a.75.75 0 0 1 0-1.5Z" />
    </svg>
);

export const FullMoonIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z" clipRule="evenodd" />
    </svg>
);

export const ThirdQuarterIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.25a9.75 9.75 0 1 0 0 19.5.75.75 0 0 0 0-1.5A8.25 8.25 0 1 1 12 3.75a.75.75 0 0 0 0-1.5Z" />
    </svg>
);
