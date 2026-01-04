import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export default forwardRef(function TextArea(
    { className = "", isFocused = false, rows = 4, maxLength, ...props },
    ref
) {
    const localRef = useRef(null);
    const [charCount, setCharCount] = useState(0);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const handleChange = (e) => {
        setCharCount(e.target.value.length);
        props.onChange && props.onChange(e);
    };

    return (
        <div className="w-full">
            <textarea
                {...props}
                rows={rows}
                ref={localRef}
                maxLength={maxLength}
                onChange={handleChange}
                className={
                    "w-full rounded-md border-gray-300 shadow-sm p-2.5 " +
                    " focus:border-green-600 focus:ring-green-600 placeholder:text-gray-500 " +
                    " dark:bg-gray-900 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 " +
                    className
                }
            />
            {maxLength && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                    {charCount} / {maxLength}
                </div>
            )}
        </div>
    );
});
