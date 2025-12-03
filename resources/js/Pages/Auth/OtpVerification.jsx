import BackButton from '@/Components/BackButton';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import OTPInput from '@/Components/OTPInput';
import OTPResendButton from '@/Components/OTPResendButton';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function OtpVerification({ email, expiresAt }) {
    const { data, setData, post, processing, errors } = useForm({ otp: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('otp'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-3">
                <h1 className="text-xl font-bold">OTP Verification</h1>
                <h2 className="text-md">
                    We sent you an email verification code to <span className='font-semibold'>{email}</span>. Please enter the code below
                </h2>
            </div>

            <form onSubmit={submit}>
                <div className="my-6">
                    <div className="flex justify-center items-center">
                        <OTPInput length={6} onComplete={(code) => setData('otp', code)} />
                    </div>
                    <InputError message={errors.otp} className="mt-2" />
                </div>

                <div className="mt-4">
                    <PrimaryButton type="submit" className="w-full flex justify-center " disabled={processing}>
                        Submit
                    </PrimaryButton>
                </div>

                <div className='mt-4 flex justify-center items-center text-sm flex-col'>
                    <p>Didn't get the code? <OTPResendButton
                        expiresAt={expiresAt}
                        onResend={async () => {
                            const response = await axios.post(route('otp.resend'));
                            return response.data.expiresAt;
                        }}
                    /></p>
                    <p>Wrong email? <a className="text-green-600 hover:text-green-800" href={route('login')}>Edit email</a></p>
                </div>

            </form>
        </GuestLayout>
    );
}
