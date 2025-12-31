export default function DangerButton({
    className = '',
    disabled,
    children,
    variant = 'danger', // 👈 new prop
    ...props
}) {
    const baseClasses =
        'inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
        (disabled ? 'opacity-25 ' : '');

    const variants = {
        danger: 'bg-red-600 hover:bg-red-500 focus:ring-red-500 active:bg-red-700',
        reactivate: 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500 active:bg-blue-700',
        warning: 'bg-orange-500 hover:bg-orange-400 focus:ring-orange-500 active:bg-orange-600',
        neutral: 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-500 active:bg-gray-700',
    };

    return (
        <button
            {...props}
            className={baseClasses + (variants[variant] || variants.danger) + ' ' + className}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
