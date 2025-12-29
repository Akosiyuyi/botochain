import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import CheckboxGroup from "@/Components/CheckboxGroup";

export default function PositionForm({ handleSubmit, handleCancelEdit, isEditing, data, setData, errors, processing,
    schoolLevelOptions, yearLevelOptions, courseOptions }) {

    const SCHOOL_LEVEL_ORDER = [
        1, // Grade School
        2, // High School
        3, // Senior High School
        4, // College
    ];

    const mergedYearLevelOptions = data.school_levels
        ?.slice()
        .sort(
            (a, b) =>
                SCHOOL_LEVEL_ORDER.indexOf(a) - SCHOOL_LEVEL_ORDER.indexOf(b)
        )
        .flatMap(levelId => yearLevelOptions[levelId] || [])
        .filter(
            (item, index, self) =>
                index === self.findIndex(i => i.value === item.value)
        );

    const mergedCourseOptions = data.school_levels
        ?.slice()
        .sort(
            (a, b) =>
                SCHOOL_LEVEL_ORDER.indexOf(a) - SCHOOL_LEVEL_ORDER.indexOf(b)
        )
        .flatMap(levelId => courseOptions[levelId] || [])
        .filter(
            (item, index, self) =>
                index === self.findIndex(i => i.value === item.value)
        );

    const haveCourses = data.school_levels?.some(id => id === 3 || id === 4);


    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <InputLabel
                    htmlFor="position"
                    value={isEditing ? "Edit Position" : "Create New Position"}
                />
                <TextInput
                    id="position"
                    name="position"
                    value={data.position}
                    placeholder="Enter Position Title"
                    className="mt-1 block w-full"
                    autoComplete="off"
                    onChange={(e) => setData('position', e.target.value)}
                />
                <InputError message={errors.position} className="mt-2" />
            </div>

            <fieldset className="mb-4">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isEditing ? "Edit Eligible School Levels" : "Add Eligible School Levels"}
                </legend>
                <CheckboxGroup
                    name="school_levels"
                    options={schoolLevelOptions}
                    value={data.school_levels}
                    onChange={(val) => setData("school_levels", val)}
                />
                <InputError message={errors.school_levels} className="mt-2" />
            </fieldset>

            {data.school_levels?.length > 0 && (
                <fieldset className="mb-4">
                    <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isEditing ? "Edit Eligible Year Levels" : "Add Eligible Year Levels"}
                    </legend>
                    <CheckboxGroup
                        name="year_levels"
                        options={mergedYearLevelOptions}
                        value={data.year_levels}
                        onChange={(val) => setData("year_levels", val)}
                    />
                    <InputError message={errors.year_levels} className="mt-2" />
                </fieldset>
            )}

            {haveCourses && (
                <fieldset className="mb-4">
                    <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isEditing ? "Edit Eligible Courses" : "Add Eligible Courses"}
                    </legend>
                    <CheckboxGroup
                        name="courses"
                        options={mergedCourseOptions}
                        value={data.courses}
                        onChange={(val) => setData("courses", val)}
                    />
                    <InputError message={errors.courses} className="mt-2" />
                </fieldset>
            )}

            <div className="flex gap-2 mt-4">
                <PrimaryButton type="submit" disabled={processing}>
                    {isEditing ? "Update Position" : "Create Position"}
                </PrimaryButton>
                {isEditing && (
                    <DangerButton type="button" onClick={handleCancelEdit}>
                        Cancel
                    </DangerButton>
                )}
            </div>
        </form>
    );
}