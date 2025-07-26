import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import spusmLogo from '../../images/SPUSM-Logo-BGRemoved.png';




export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            {/* Left side image or branding section */}
            <div className="hidden w-1/2 bg-cyan-600 lg:block"></div>

            {/* Right side form section */}
            <div className="px-4 py-8 flex flex-col w-full justify-start items-center lg:w-1/2 lg:justify-center">
                <div className='w-36 mb-8 lg:hidden'>
                    <img src={spusmLogo} alt="School Logo" />
                </div>
                <div className=" w-full max-w-2xl lg:max-w-2xl h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:max-w-max">
                    {children}
                </div>
            </div>
        </div>

    );
}
