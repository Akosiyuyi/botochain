import { Modal } from '@inertiaui/modal-react';
import { X } from "lucide-react";
import { useForm } from '@inertiajs/react';
import StudentForm from '@/Components/StudentForm';

export default function CreateStudentModal() {
    const { data, setData, post, processing, errors } = useForm({
        student_id: "",
        name: "",
        school_level: "",
        year_level: "",
        course: "",
        section: "",
    });

    return (
        <Modal>
            {({ close }) => {
                // submit function has access to close()
                const submit = (e) => {
                    e.preventDefault();

                    post(route('admin.students.store'), {
                        onSuccess: () => {
                            // reset form
                            setData({
                                student_id: "",
                                name: "",
                                school_level: "",
                                year_level: "",
                                course: "",
                                section: "",
                            });

                            // close modal
                            close();
                        },
                    });
                };

                return (
                    <div className="relative p-4">
                        <header className="flex flex-row items-center justify-between mb-4">
                            <h1 className="text-lg font-semibold dark:text-white">
                                Create New Student
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
                        />
                    </div>
                );
            }}
        </Modal>
    );
}
