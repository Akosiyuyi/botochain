import Modal from "./Modal";
import { router, useForm } from '@inertiajs/react';
import SecondaryButton from "./SecondaryButton";
import DangerButton from "./DangerButton";

export default function DeleteModal({ entityName, deleteRoute, params, confirmingDeletion, setConfirmingDeletion }) {
    const { processing } = useForm();

    const closeModal = () => {
        setConfirmingDeletion(false);
    };

    const deleteEntity = (e) => {
        e.preventDefault();

        router.delete(route(deleteRoute, params), {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <Modal show={confirmingDeletion}
            onClose={closeModal}
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description">

            <div className="p-6">
                <h2 id="delete-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                    Are you sure you want to delete this {entityName}?
                </h2>

                <p id="delete-modal-description" role="alert" className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Once this {entityName} is deleted, all of its resources and
                    data will be permanently deleted.
                </p>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={closeModal}>
                        Cancel
                    </SecondaryButton>

                    <DangerButton onClick={deleteEntity} disabled={processing} className="ms-3" aria-label={`Delete ${entityName}`}>
                        {processing ? "Deleting..." : `Delete ${entityName}`}
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}