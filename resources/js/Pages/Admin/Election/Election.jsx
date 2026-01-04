import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import ElectionCard from '@/Components/Election/ElectionCard';
import { ModalLink } from '@inertiaui/modal-react';
import noElectionsFlat from '@images/NoElectionsFlat.png';
import { useState } from 'react';
import LongDropdown from '@/Components/LongDropdown';

export default function Election({ elections, routes }) {
    const [showPending, setShowPending] = useState(true);
    const [showActive, setShowActive] = useState(true);

    const renderElection = (status) => {
        return (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {elections.some(election => election.status === status) ? (
                    elections
                        .filter(election => election.status === status)
                        .map(election => (
                            <ElectionCard
                                key={election.id}
                                imagePath={election.image_path}
                                title={election.title}
                                schoolLevels={election.school_levels}
                                date={election.display_date}
                                link={election.link}
                                mode={status}
                            />
                        ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center text-center py-12">
                        <img
                            src={noElectionsFlat}
                            alt="No Elections"
                            className="w-80"
                        />
                        <div className="text-gray-500 dark:text-gray-200 text-lg">
                            There are no {status} elections.
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return (
        <>
            <Head title="Election" />
            <div className="mx-auto max-w-7xl">
                <LongDropdown componentName={"Draft Elections"} showComponent={showPending} setShowComponent={setShowPending} />
                {showPending && renderElection("draft")}

                <LongDropdown className="mt-4" componentName={"Upcoming Elections"} showComponent={showActive} setShowComponent={setShowActive} />
                {showActive && renderElection("upcoming")}
            </div>
        </>
    );
}

Election.layout = (page) => {
    const header = (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
            Election
        </h2>
    );

    const button = (
        <ModalLink
            href={route("admin.election.create")}
            closeButton={false}
            panelClasses="bg-white dark:bg-gray-800 rounded-lg"
        >
            <PrimaryButton>Add Election</PrimaryButton>
        </ModalLink>
    );

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};
