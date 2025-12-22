import SelectInputForForms from "./SelectInputForForms";
import TextInput from "./TextInput";
import InputLabel from "./InputLabel";
import InputError from "./InputError";
import PrimaryButton from "./PrimaryButton";

export default function StudentForm({ data, setData, errors, onSubmit, processing, isEdit, schoolOptions }) {
    const isElemOrJhs = data.school_level === "Grade School" || data.school_level === "Junior High";
    const { schoolLevelOptions, yearLevelOptions, courseOptions } = schoolOptions;

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
                        options={courseOptions[data.school_level] || []}
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
