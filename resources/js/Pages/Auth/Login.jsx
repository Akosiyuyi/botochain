import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="mb-3">
                <h1 className="text-xl font-bold">SIGN IN to your registered account</h1>
                <h2 className="text-md">
                    Sign in using your registered email address to continue
                </h2>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email Address" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="Enter your email address"
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
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
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            className='focus:ring-green-700'
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-green-600 hover:text-green-800"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>

                <div className="mt-4">
                    <PrimaryButton type="submit" className="w-full flex justify-center " disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
            <div className='mt-4 flex justify-center text-sm'>
                <p>Doesn't have an account? <a className="text-green-600 hover:text-green-800" href={route('register')}>Register</a></p>
            </div>
        </GuestLayout>
    );
}
