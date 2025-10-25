import React from 'react';

interface IconProps {
    className?: string;
}

export const LocationIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 005.169-4.418 16.573 16.573 0 00-5.48-12.498.757.757 0 00-1.218-.023 16.573 16.573 0 00-5.48 12.498 16.975 16.975 0 005.17 4.418zM12 15a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);
