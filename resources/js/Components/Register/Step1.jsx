import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import InputError from "../InputError";
import PrimaryButton from "../PrimaryButton";

export default function Step1({ data, setData, errors, goToStep2 }) {
    return (
        <div>
            <div className="mb-3">
                <h1 className="text-xl font-bold">PERSONAL INFO from school ID</h1>
                <h2 className="text-md">
                    Enter your personal information as shown on your ID to continue
                </h2>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); goToStep2(); }}>
                <div>
                    <InputLabel htmlFor="id_number" value="ID Number" />
                    <TextInput
                        id="id_number"
                        name="id_number"
                        value={data.id_number}
                        placeholder="Enter your ID number (e.g., 2025-0001)"
                        className="mt-1 block w-full"
                        onChange={(e) => setData('id_number', e.target.value)}
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
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <PrimaryButton className="w-full flex justify-center" type="submit">
                        Next: Email Registration
                    </PrimaryButton>
                </div>
            </form>
        </div>
    )
}
