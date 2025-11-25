import InputError from "../InputError";
import PrimaryButton from "../PrimaryButton";
import OTPInput from "../OTPInput";
import OTPResendButton from "../OTPResendButton";

export default function Step3({ data, processing, submit }) {
    return (
        <div>
            <div className="mb-3">
                <h1 className="text-xl font-bold">CHECK your credentials</h1>
                <h2 className="text-md">
                    Check if all credentials are correct before continuing to account registration
                </h2>

                <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-300">
                    <ol>
                        <li><span className="font-semibold">ID Number: </span>{data.id_number}</li>
                        <li><span className="font-semibold">Name: </span> {data.name}</li>
                        <li><span className="font-semibold">Email Address: </span> {data.email}</li>
                    </ol>
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="mt-2">
                    <PrimaryButton
                        type="submit"
                        className="w-full flex justify-center"
                        disabled={processing}
                    >
                        Submit
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
