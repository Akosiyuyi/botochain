import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import ElectionCard from '@/Components/ElectionCard';
import { ModalLink } from '@inertiaui/modal-react';

export default function Election({ elections }) {
    console.log(elections);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                    Election
                </h2>
            }
            button={
                <ModalLink
                    href={route("admin.election.create")}
                    closeButton={false}
                    panelClasses="bg-white dark:bg-gray-800 rounded-lg"
                >
                    <PrimaryButton>Add Election</PrimaryButton>
                </ModalLink>
            }
        >
            <Head title="Election" />

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {elections.map((election) => (
                        <ElectionCard
                            key={election.id}
                            imagePath={election.image_path}
                            title={election.title}
                            schoolLevels={election.school_levels}
                            created_at={election.created_at}
                        />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
