import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import InputError from "../InputError";
import PrimaryButton from "../PrimaryButton";

export default function Step2({ data, setData, errors, processing, goToStep3 }) {
    return (
        <div>
            <div className="mb-3">
                <h1 className="text-xl font-bold">REGISTER to your email address</h1>
                <h2 className="text-md">
                    Register using your personal or school provided email address to continue
                </h2>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); goToStep3(); }}>
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
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4">
                    <PrimaryButton
                        type="submit"
                        className="w-full flex justify-center"
                        disabled={processing}
                    >
                        Next: Email Verification
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
