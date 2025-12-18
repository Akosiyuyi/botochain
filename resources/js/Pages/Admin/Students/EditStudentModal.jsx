import { Modal } from '@inertiaui/modal-react';
import { X } from "lucide-react";
import { useForm } from '@inertiajs/react';
import StudentForm from '@/Components/StudentForm';

export default function EditStudentModal({ student }) {
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
                            <h1 className="text-lg font-semibold dark:text-white">
                                Update Student
                            </h1>
                            <button
                                type="button"
                                onClick={close}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <StudentForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            onSubmit={submit}
                            processing={processing}
                            isEdit={true}
                        />
                    </div>
                );
            }}
        </Modal>
    );
}
