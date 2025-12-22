import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import CheckboxGroup from "@/Components/CheckboxGroup";

export default function ElectionCreationForm({ data, setData, errors, onSubmit, processing, schoolLevelOptions }) {
    return (
        <form onSubmit={onSubmit}>
            {/* Election Title */}
            <div>
                <InputLabel htmlFor="title" value="Title" />
                <TextInput
                    id="title"
                    name="title"
                    value={data.title}
                    placeholder="Enter Election Title"
                    className="mt-1 block w-full"
                    onChange={(e) => setData("title", e.target.value)}
                />
                <InputError message={errors.title} className="mt-2" />
            </div>

            {/* Eligible School Levels */}
            <fieldset className="mt-4">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Eligible School Level
                </legend>

                <CheckboxGroup
                    name="school_levels"
                    options={schoolLevelOptions}
                    value={data.school_levels}
                    onChange={(val) => setData("school_levels", val)}
                />

                <InputError message={errors.school_levels} className="mt-2" />
            </fieldset>

            {/* Submit Button */}
            <div className="mt-4">
                <PrimaryButton type="submit" disabled={processing}>
                    {processing ? "Saving..." : "Save"}
                </PrimaryButton>
            </div>
        </form>
    );
}
