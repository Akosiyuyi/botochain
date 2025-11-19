import BackButton from '@/Components/BackButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { IdCard, Mail, ShieldCheck, Check } from 'lucide-react';
import Step1 from '@/Components/Register/Step1';
import Step2 from '@/Components/Register/Step2';

export default function Register({ step: initialStep = 1, prefill = {} }) {
    const [step, setStep] = useState(initialStep);

    const { data, setData, post, errors, processing, reset } = useForm({
        id_number: prefill.id_number || '',
        name: prefill.name || '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        setStep(initialStep); // sync with props
    }, [initialStep]);

    const goBack = () => {
        post(route('register.back'), { step });
    };


    const goToStep2 = () => {
        post(route('register.step1'), {
            id_number: data.id_number,
            name: data.name,
        });
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

            {step > 1 && (
                    <BackButton type="button" onClick={() => goBack()}>
                        Back
                    </BackButton>
            )}

            <div className="flex justify-center">
                <ol className="flex items-center justify-center w-80 space-x-4 my-4">
                    {/* Step 1 */}
                    <li
                        className={`flex w-full items-center 
      after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block after:ms-4 after:rounded-full
      ${step > 1 ? 'after:border-green-400' : 'after:border-gray-200'} 
      ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}
                    >
                        <span
                            className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0
        ${step >= 1 ? 'bg-green-100' : 'bg-gray-100'}`}
                        >
                            {step > 1 ? (
                                <Check className="h-5 w-5" />
                            ) : (
                                <IdCard className="h-5 w-5" />
                            )}
                        </span>
                    </li>

                    {/* Step 2 */}
                    <li
                        className={`flex w-full items-center 
      after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block after:ms-4 after:rounded-full
      ${step > 2 ? 'after:border-green-400' : 'after:border-gray-200'} 
      ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}
                    >
                        <span
                            className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0
        ${step >= 2 ? 'bg-green-100' : 'bg-gray-100'}`}
                        >
                            {step > 2 ? (
                                <Check className="h-5 w-5" />
                            ) : (
                                <Mail className="h-5 w-5" />
                            )}
                        </span>
                    </li>

                    {/* Step 3 */}
                    <li
                        className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}
                    >
                        <span
                            className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0
        ${step >= 3 ? 'bg-green-100' : 'bg-gray-100'}`}
                        >
                            {step === 3 ? (
                                <Check className="h-5 w-5" />
                            ) : (
                                <ShieldCheck className="h-5 w-5" />
                            )}
                        </span>
                    </li>
                </ol>

            </div>

            {step === 1 && (
                <Step1
                    data={data}
                    setData={setData}
                    errors={errors}
                    goToStep2={goToStep2}
                />
            )}

            {step === 2 && (
                <Step2
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    goToStep3={submit}
                />
            )}

            <div className='mt-4 flex justify-center text-sm'>
                <p>Already have an account? <a className="text-green-600 hover:text-green-800" href={route('login')}>Sign In</a></p>
            </div>
        </GuestLayout>
    );
}
