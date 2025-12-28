import { useEffect } from 'react';

export const useBodyScrollLock = (isLocked) => {
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        
        if (isLocked) {
            document.body.style.overflow = 'hidden';
            // Optional: Add padding-right to prevent layout shift if scrollbar disappears
            // document.body.style.paddingRight = 'var(--scrollbar-width)'; 
        }

        return () => {
            document.body.style.overflow = originalStyle;
            // document.body.style.paddingRight = '0';
        };
    }, [isLocked]);
};