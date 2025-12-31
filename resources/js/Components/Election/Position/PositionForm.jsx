import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import CheckboxGroup from "@/Components/CheckboxGroup";
import { SCHOOL_LEVEL_ORDER } from "@/Constants/schoolLevel";

export default function PositionForm({ handleSubmit, handleCancelEdit, isEditing, form, options }) {

    const { data, setData, errors, processing } = form;

    // sort by Grade School to College
    const sortedSchoolLevelIds = (data.school_levels ?? [])
        .slice()
        .sort((a, b) => {
            const aLabel = options.schoolLevelOptions.find(l => l.value === a)?.label;
            const bLabel = options.schoolLevelOptions.find(l => l.value === b)?.label;

            return (
                SCHOOL_LEVEL_ORDER.indexOf(aLabel) -
                SCHOOL_LEVEL_ORDER.indexOf(bLabel)
            );
        });


    // year levels grouped by school level
    const groupedYearLevels = sortedSchoolLevelIds.map(levelId => ({
        levelId,
        label: options.schoolLevelOptions.find(l => l.value === levelId)?.label,
        years: options.yearLevelOptions[levelId] || [],
    }));


    // courses grouped by year level
    const groupedCourses = sortedSchoolLevelIds
        .filter(levelId => levelId === 3 || levelId === 4)
        .map(levelId => ({
            levelId,
            label: options.schoolLevelOptions.find(l => l.value === levelId)?.label,
            courses: options.courseOptions[levelId] || [],
        }));


    const haveCourses = data.school_levels?.some(id => id === 3 || id === 4);


    // helper function that clears dependent fields to school level
    const cleanDependentSelections = (selectedLevels) => {
        // allowed year levels based on remaining school levels
        const allowedYearLevels = selectedLevels.flatMap(
            levelId => options.yearLevelOptions[levelId]?.map(y => y.value) || []
        );

        const cleanedYearLevels = (data.year_levels ?? []).filter(y =>
            allowedYearLevels.includes(y)
        );

        // only SHS (3) & College (4) have courses
        const allowedCourseLevels = selectedLevels.filter(id => id === 3 || id === 4);

        const allowedCourses = allowedCourseLevels.flatMap(
            levelId => options.courseOptions[levelId]?.map(c => c.value) || []
        );

        const cleanedCourses = (data.courses ?? []).filter(c =>
            allowedCourses.includes(c)
        );

        return {
            year_levels: cleanedYearLevels,
            courses: cleanedCourses,
        };
    };

    return (
        <form onSubmit={handleSubmit}>

            {/* position title */}
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


            {/* Position School Levels */}
            <fieldset className="mb-4">
                <legend className="text-sm font-medium text-gray-700 dark:text-white">
                    {isEditing ? "Edit Eligible School Levels" : "Add Eligible School Levels"}
                </legend>
                <CheckboxGroup
                    name="school_levels"
                    options={options.schoolLevelOptions}
                    value={data.school_levels}
                    onChange={(val) => {
                        const cleaned = cleanDependentSelections(val);

                        setData({
                            ...data,
                            school_levels: val,
                            year_levels: cleaned.year_levels,
                            courses: cleaned.courses,
                        });
                    }}

                />
                <InputError message={errors.school_levels} className="mt-2" />
            </fieldset>


            {/* Position Year Levels */}
            <fieldset className="mb-4">
                <legend className="text-sm font-medium text-gray-700 dark:text-white">
                    {isEditing ? "Edit Eligible Year Levels" : "Add Eligible Year Levels"}
                </legend>

                {groupedYearLevels.length === 0 && (
                    <p className="px-4 pt-4 pb-2 text-center text-gray-500">
                        Select a school level first.
                    </p>
                )}

                {groupedYearLevels.map(level => (
                    <div key={level.levelId} className="mt-3">
                        <p className="font-normal text-sm text-center text-gray-700 dark:text-gray-300">
                            {level.label}
                        </p>

                        <div className="mt-2">
                            <CheckboxGroup
                                name={`year_levels_${level.levelId}`}
                                options={level.years}
                                value={data.year_levels}
                                onChange={(val) => setData("year_levels", val)}
                            />
                        </div>

                        {/* per-school-level error */}
                        <InputError
                            message={errors?.[`year_levels.${level.levelId}`]}
                            className="mt-1 text-center"
                        />
                    </div>
                ))}
            </fieldset>


            {/* Position Courses */}
            {haveCourses && (
                <fieldset className="mb-4">
                    <legend className="text-sm font-medium text-gray-700 dark:text-white">
                        {isEditing ? "Edit Eligible Courses" : "Add Eligible Courses"}
                    </legend>

                    {groupedCourses.map(level => (
                        <div key={level.levelId} className="mt-3">
                            <p className="font-normal text-sm text-center text-gray-700 dark:text-gray-300">
                                {level.label}
                            </p>

                            <div className="mt-2">
                                <CheckboxGroup
                                    name={`courses_${level.levelId}`}
                                    options={level.courses}
                                    value={data.courses}
                                    onChange={(val) => setData("courses", val)}
                                />
                            </div>

                            {/* per-school-level error */}
                            <InputError
                                message={errors?.[`courses.${level.levelId}`]}
                                className="mt-1 text-center"
                            />
                        </div>
                    ))}
                </fieldset>
            )}


            {/* Submit Button */}
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
        </form >
    );
}