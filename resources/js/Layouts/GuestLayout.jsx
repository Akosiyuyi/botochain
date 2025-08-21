import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import spusmLogo from '../../images/SPUSM-Logo-BGRemoved.png';
import { useEffect } from 'react';

export default function GuestLayout({ children }) {
    useEffect(() => {
        // Remove dark mode for guest pages
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left side image or branding section */}
            <div className="hidden w-1/2 bg-cyan-600 lg:block"></div>

            {/* Right side form section */}
            <div className="px-4 py-8 flex flex-col w-full justify-start items-center lg:w-1/2 lg:justify-center">
                <div className='w-36 mb-8 lg:hidden'>
                    <img src={spusmLogo} alt="School Logo" />
                </div>
                <div className=" w-full max-w-2xl lg:max-w-2xl h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-lg lg:max-w-max">
                    {children}
                </div>
            </div>
        </div>

    );
}
