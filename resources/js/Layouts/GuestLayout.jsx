import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import spusmLogo from '../../images/SPUSM-Logo-BGRemoved.png';
import spusmBG from '../../images/SPUSM building cropped.jpg';
import ebotoLogo from '../../images/eBoto.svg';
import { useEffect } from 'react';

export default function GuestLayout({ children }) {
    useEffect(() => {
        // Remove dark mode for guest pages
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="flex min-h-screen">
            {/* Left side image with green tint */}
            <div className="hidden w-1/2 lg:block relative h-screen overflow-hidden">
                {/* Background image with blur */}
                <img
                    src={spusmBG}
                    alt="School Building"
                    className="w-full h-full object-cover object-bottom filter blur-[1.5px] scale-110"
                />

                {/* Green overlay */}
                <div className="absolute inset-0 bg-gray-900 opacity-40"></div>

                {/* Logos centered */}
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                    <div className="w-36 mb-2">
                        <img src={spusmLogo} alt="School Logo" />
                    </div>
                    <h1 className="text-white font-black text-[2.50rem] mb-2 text-center mx-8">ST. PAUL UNIVERSITY SAN MIGUEL</h1>
                    <div className='flex'>
                        <img src={ebotoLogo} alt="eBoto Logo" className="w-20 mr-2" />
                        <h1 className="text-white font-extrabold text-4xl mt-6">EBOTO</h1>
                    </div>

                </div>
            </div>


            {/* Right side form section */}
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-8 bg-white">
                {/* Logo for mobile */}
                <div className="w-36 mb-8 lg:hidden">
                    <img src={spusmLogo} alt="School Logo" />
                </div>

                {/* Form container */}
                <div className="w-full max-w-2xl lg:max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
