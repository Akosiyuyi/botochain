import { Modal } from '@inertiaui/modal-react';
import { X } from "lucide-react";
import { useForm } from '@inertiajs/react';
import DangerButton from '@/Components/DangerButton';

export default function ConfirmUnenrollAllModal() {
    const { patch } = useForm({});

    return (
        <Modal>
            {({ close }) => {
                const submit = (e) => {
                    e.preventDefault();
                    patch(route('admin.students.unenrollAll'), {
                        onSuccess: close,
                    });
                };

                return (
                    <div className="relative p-4">
                        <header className="flex items-center justify-between mb-4">
                            <h1 className="text-lg font-semibold dark:text-white">
                                Are you sure you want to unenroll all students?
                            </h1>
                            <button
                                type="button"
                                onClick={close}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <p
                            id="deactivate-modal-description"
                            role="alert"
                            className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                        >
                            Once all students are set to <span className="font-semibold">Unenrolled</span>, 
                            their corresponding accounts will also be deactivated and access to the system revoked.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={close}
                                className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <DangerButton onClick={submit}>
                                Confirm Unenroll All
                            </DangerButton>
                        </div>
                    </div>
                );
            }}
        </Modal>
    );
}
