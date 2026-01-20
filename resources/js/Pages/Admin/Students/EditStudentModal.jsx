import { Modal } from '@inertiaui/modal-react';
import { X } from "lucide-react";
import { useForm } from '@inertiajs/react';
import StudentForm from '@/Components/StudentForm';

export default function EditStudentModal({ student, schoolOptions }) {
    const { data, setData, patch, processing, errors } = useForm({
        student_id: student?.student_id ?? "",
        name: student?.name ?? "",
        school_level: student?.school_level ?? "",
        year_level: student?.year_level ?? "",
        course: student?.course ?? "",
        section: student?.section ?? "",
        status: student.status,
    });

    return (
        <Modal>
            {({ close }) => {
                // submit function has access to close()
                const submit = (e) => {
                    e.preventDefault();

                    patch(route('admin.students.update', student.id), {
                        onSuccess: () => {
                            // close modal
                            close();
                        },
                    });
                };

                return (
                    <div className="relative p-4">
                        <header className="flex flex-row items-center justify-between mb-4">
                            <h1 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                                Update Student
                                {data.status === "Enrolled" ? (
                                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        Enrolled
                                    </span>
                                ) : (
                                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        Unenrolled
                                    </span>
                                )}
                            </h1>

                            <button
                                type="button"
                                onClick={close}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 
                                        dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-200 
                                        p-4 mb-4">
                            <p className="font-bold">Warning</p>
                            <p>
                                Editing student information may affect their access and data. Please proceed with caution.
                            </p>
                        </div>

                        <StudentForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            onSubmit={submit}
                            processing={processing}
                            isEdit={true}
                            schoolOptions={schoolOptions}
                        />
                    </div>
                );
            }}
        </Modal>
    );
}
