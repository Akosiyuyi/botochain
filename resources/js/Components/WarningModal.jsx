import Modal from "./Modal";
import { router, useForm } from "@inertiajs/react";
import SecondaryButton from "./SecondaryButton";
import PrimaryButton from "./PrimaryButton";
import { AlertTriangle } from "lucide-react";

export default function WarningModal({
    entityName,
    routeName,
    params,
    handleState,
    modalTitle= "Please Confirm",
    actionLabel = "Confirm",
    description = "Are you sure you want to proceed with this action?",
    method = "post", // default method
}) {
    const { processing } = useForm();
    const { confirm, setConfirm } = handleState;

    const closeModal = () => {
        setConfirm(false);
    };

    const submit = (e) => {
        e.preventDefault();

        const url = route(routeName, params);

        // choose method dynamically
        switch (method.toLowerCase()) {
            case "post":
                router.post(url, {}, { preserveScroll: true, onSuccess: closeModal });
                break;
            case "put":
                router.put(url, {}, { preserveScroll: true, onSuccess: closeModal });
                break;
            case "patch":
                router.patch(url, {}, { preserveScroll: true, onSuccess: closeModal });
                break;
            case "delete":
                router.delete(url, { preserveScroll: true, onSuccess: closeModal });
                break;
            default:
                console.error(`Unsupported method: ${method}`);
        }
    };

    return (
        <Modal
            show={confirm}
            onClose={closeModal}
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
        >
            <div className="p-6 space-y-4">
                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    <h2
                        id="confirm-modal-title"
                        className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        {modalTitle}
                    </h2>
                </div>

                {/* Description */}
                <p
                    id="confirm-modal-description"
                    className="text-sm text-gray-600 dark:text-gray-400"
                >
                    {description}
                </p>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={closeModal}>
                        Cancel
                    </SecondaryButton>

                    <PrimaryButton
                        onClick={submit}
                        disabled={processing}
                        aria-label={`${actionLabel} ${entityName}`}
                    >
                        {processing ? "Processing..." : `${actionLabel}`}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
