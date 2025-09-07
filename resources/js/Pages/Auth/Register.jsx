import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import BackButton from '@/Components/BackButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        name: '',
        id_number: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const goToStep2 = () => {
        clearErrors(); // Clear previous errors

        let hasError = false;

        if (!data.id_number) {
            setError('id_number', 'ID number is required.');
            hasError = true;
        }

        if (!data.name) {
            setError('name', 'Name is required.');
            hasError = true;
        }

        if (hasError) return;

        setStep(2);
    };



    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            {step === 2 && (
                <>
                    <BackButton
                        type="button"
                        onClick={() => setStep(1)}
                    >
                        Back
                    </BackButton>
                </>
            )}

            <div className='flex justify-center'>
                <ol className=" flex justify-center items-center w-full text-sm text-gray-500 sm:text-base pt-2 pb-4 space-x-4 rtl:space-x-reverse">
                    <li className="flex items-center text-green-600">
                        <span className="flex items-center justify-center w-5 h-5 me-2 text-xs border border-green-600 rounded-full shrink-0">
                            {step === 2 ?
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4"
                                >
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                                : 1
                            }
                        </span>
                        Personal <span className="hidden sm:inline-flex sm:ms-2">Info</span>
                        <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" />
                        </svg>
                    </li>
                    <li className={`flex items-center ${step === 2 ? 'text-green-600' : ''}`}>
                        <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs shrink-0 rounded-full border ${step === 2 ? 'border-green-600' : 'border-gray-500 rounded-full'}`}>
                            2
                        </span>
                        Register <span className="hidden sm:inline-flex sm:ms-2">Account</span>
                        <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" />
                        </svg>
                    </li>
                </ol>

            </div>


            {step === 1 && (
                <>
                    <div className="mb-3">
                        <h1 className="text-xl font-bold">REGISTER to your ID number</h1>
                        <h2 className="text-md">
                            Register using your ID number and the full name as shown on your ID to continue
                        </h2>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div className="mb-3">
                        <h1 className="text-xl font-bold">REGISTER to your email address</h1>
                        <h2 className="text-md">
                            Register using your personal or school provided email address to continue
                        </h2>
                    </div>
                </>
            )}



            <form onSubmit={submit}>
                {step === 1 && (
                    <>
                        <div>
                            <InputLabel htmlFor="id_number" value="ID Number" />
                            <TextInput
                                id="id_number"
                                name="id_number"
                                value={data.id_number}
                                placeholder="Enter your ID number (e.g., 2025-0001)"
                                className="mt-1 block w-full"
                                onChange={(e) => setData('id_number', e.target.value)}
                                required
                            />
                            <InputError message={errors.id_number} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="name" value="Full Name" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="Enter your full name (e.g., Juan Dela Cruz)"
                                className="mt-1 block w-full"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <PrimaryButton className="w-full flex justify-center" type="button" onClick={() => goToStep2()}>
                                Next
                            </PrimaryButton>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="mt-4">
                            <InputLabel htmlFor="email" value="Email Address" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="Enter your email address"
                                className="mt-1 block w-full"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="Enter your password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                placeholder="Confirm your password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4">
                            <PrimaryButton type="submit" className="w-full flex justify-center" disabled={processing}>
                                Register
                            </PrimaryButton>
                        </div>
                    </>
                )}
            </form>

            <div className='mt-4 flex justify-center text-sm'>
                <p>Already have an account? <a className="text-green-600 hover:text-green-800" href={route('login')}>Sign In</a></p>
            </div>
        </GuestLayout>
    );
}
