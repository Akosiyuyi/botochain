import SelectInputForForms from "./SelectInputForForms";
import TextInput from "./TextInput";
import InputLabel from "./InputLabel";
import InputError from "./InputError";
import PrimaryButton from "./PrimaryButton";

export default function StudentForm({ data, setData, errors, onSubmit, processing, isEdit }) {
    const isElemOrJhs = data.school_level === "Grade School" || data.school_level === "Junior High";

    const schoolLevelOptions = [
        { label: "Grade School", value: "Grade School" },
        { label: "Junior High", value: "Junior High" },
        { label: "Senior High", value: "Senior High" },
        { label: "College", value: "College" },
    ];

    const yearLevelOptions = {
        "Grade School": [
            { label: "Grade 1", value: "Grade 1" },
            { label: "Grade 2", value: "Grade 2" },
            { label: "Grade 3", value: "Grade 3" },
            { label: "Grade 4", value: "Grade 4" },
            { label: "Grade 5", value: "Grade 5" },
            { label: "Grade 6", value: "Grade 6" },
        ],
        "Junior High": [
            { label: "Grade 7", value: "Grade 7" },
            { label: "Grade 8", value: "Grade 8" },
            { label: "Grade 9", value: "Grade 9" },
            { label: "Grade 10", value: "Grade 10" },
        ],
        "Senior High": [
            { label: "Grade 11", value: "Grade 11" },
            { label: "Grade 12", value: "Grade 12" },
        ],
        "College": [
            { label: "1st Year", value: "1st Year" },
            { label: "2nd Year", value: "2nd Year" },
            { label: "3rd Year", value: "3rd Year" },
            { label: "4th Year", value: "4th Year" },
        ],
    };

    const courselOptions = {
        "Senior High": [
            { label: "STEM", value: "STEM" },
            { label: "ABM", value: "ABM" },
            { label: "GAS", value: "GAS" },
        ],
        "College": [
            { label: "BSCS", value: "BSCS" },
            { label: "BSBA", value: "BSBA" },
            { label: "BSED", value: "BSED" },
            { label: "BEED", value: "BEED" },
            { label: "BSHM", value: "BSHM" },
        ],
    };

    const statusOptions = [
        { label: "Enrolled", value: "Enrolled" },
        { label: "Unenrolled", value: "Unenrolled" },
    ];

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Student ID */}
            <div>
                <InputLabel htmlFor="student_id" value="Student ID" />
                <TextInput
                    id="student_id"
                    name="student_id"
                    value={data.student_id}
                    onChange={(e) => setData("student_id", e.target.value)}
                    placeholder="Enter Student ID"
                    className="mt-1 block w-full"
                />
                <InputError message={errors.student_id} className="mt-2" />
            </div>

            {/* Name */}
            <div>
                <InputLabel htmlFor="name" value="Name" />
                <TextInput
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="Enter Student Name"
                    className="mt-1 block w-full"
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            {/* Student School and Year Level */}
            <div className="flex gap-2">
                <div className="w-1/2">
                    <InputLabel htmlFor="school_level" value="School Level" />
                    <SelectInputForForms
                        id="school_level"
                        options={schoolLevelOptions}
                        value={data.school_level}
                        onChange={(val) => {
                            setData("school_level", val);
                            // reset dependent fields
                            setData("year_level", "");
                            setData("course", "");
                        }}
                        className="mt-1"
                    />
                    <InputError message={errors.school_level} className="mt-2" />
                </div>
                <div className="w-1/2">
                    <InputLabel htmlFor="year_level" value="Year Level" />
                    <SelectInputForForms
                        id="year_level"
                        options={yearLevelOptions[data.school_level] || []}
                        value={data.year_level}
                        onChange={(val) => setData("year_level", val)}
                        disabled={!data.school_level}
                        className="mt-1"
                    />
                    <InputError message={errors.year_level} className="mt-2" />
                </div>
            </div>

            {/* Course and Section */}
            <div className="flex gap-2">
                <div className="w-1/2">
                    <InputLabel htmlFor="course" value="Course" />
                    <SelectInputForForms
                        id="course"
                        options={courselOptions[data.school_level] || []}
                        value={data.course}
                        onChange={(val) => setData("course", val)}
                        disabled={isElemOrJhs || !data.school_level}
                        className="mt-1"
                    />
                    <InputError message={errors.course} className="mt-2" />
                </div>
                <div className="w-1/2">
                    <InputLabel htmlFor="section" value="Section" />
                    <TextInput
                        id="section"
                        name="section"
                        value={data.section}
                        onChange={(e) => setData("section", e.target.value)}
                        placeholder="Enter Section"
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.section} className="mt-2" />
                </div>
            </div>

            {isEdit && (
                <div>
                    <InputLabel htmlFor="status" value="Status" />
                    <SelectInputForForms
                        id="status"
                        options={statusOptions}
                        value={data.status}
                        onChange={(val) => setData("status", val)}
                        className="mt-1"
                    />
                    <InputError message={errors.status} className="mt-2" />
                </div>
            )}

            <PrimaryButton type="submit" disabled={processing}>
                {processing ? "Saving..." : "Save"}
            </PrimaryButton>
        </form>
    );
}
