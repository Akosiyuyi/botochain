// TimeInput.jsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TimeInput(
    { className = '', isFocused = false, ...props },
    ref
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className="relative w-full">
            <input
                {...props}
                type="time"
                className={
                    'w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 ' +
                    'dark:bg-gray-900 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 text-sm ' +
                    'disabled:cursor-not-allowed ' +
                    className
                }
                ref={localRef}
            />
        </div>
    );
});
