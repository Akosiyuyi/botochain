import { useMemo, useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Check, ChevronDown, ChevronUp, ShieldCheck, Smartphone, Clock, AlertCircle, XCircle, CheckCircle, X } from 'lucide-react';

export default function VotingForm({ election, setup }) {
    const { flash, errors } = usePage().props;
    const [showFlash, setShowFlash] = useState(true);

    // Reset showFlash when new flash messages or errors appear
    useEffect(() => {
        setShowFlash(true);
    }, [flash, errors]);

    // Safely merge positions with their candidates (setup gives them separately)
    const positionsWithCandidates = useMemo(() => {
        const positions = setup?.positions ?? [];
        const candidates = setup?.candidates ?? [];
        const byPosition = candidates.reduce((acc, c) => {
            const pid = c.position?.id ?? c.position_id ?? c.positionId;
            if (!pid) return acc;
            acc[pid] = acc[pid] ?? [];
            acc[pid].push({
                id: c.id,
                name: c.name,
                description: c.description,
                partylist: c.partylist ?? null,
            });
            return acc;
        }, {});
        return positions.map((p) => ({
            ...p,
            candidates: byPosition[p.id] ?? [],
        }));
    }, [setup]);

    const [expanded, setExpanded] = useState(() => new Set(positionsWithCandidates.map((p) => p.id)));
    const [choices, setChoices] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggle = (id) => {
        const next = new Set(expanded);
        next.has(id) ? next.delete(id) : next.add(id);
        setExpanded(next);
    };

    const selectCandidate = (positionId, candidateId) => {
        setChoices((prev) => {
            // toggle off if already selected
            if (prev[positionId] === candidateId) {
                const next = { ...prev };
                delete next[positionId];
                return next;
            }
            return { ...prev, [positionId]: candidateId };
        });
    };

    const doneCount = Object.keys(choices).length;
    const total = positionsWithCandidates.length;
    const progress = total ? Math.round((doneCount / total) * 100) : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            route('voter.election.vote.store', election.id),
            { choices }, // choices object with positionId: candidateId pairs
            {
                onError: () => setIsSubmitting(false),
                onSuccess: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <div className="pb-6 space-y-4 text-gray-900 dark:text-gray-100">
            {/* Flash Messages */}
            {showFlash && flash?.error && (
                <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="flex-shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Error</h3>
                                <p className="mt-1 text-sm text-red-800 dark:text-red-200">{flash.error}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFlash(false)}
                            className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                            aria-label="Dismiss error"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {showFlash && flash?.success && (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Success</h3>
                                <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">{flash.success}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFlash(false)}
                            className="flex-shrink-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                            aria-label="Dismiss success message"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Validation Errors */}
            {showFlash && errors && Object.keys(errors).length > 0 && (
                <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="flex-shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Validation Error</h3>
                                <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-red-800 dark:text-red-200">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFlash(false)}
                            className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                            aria-label="Dismiss validation errors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-5 sm:px-6 sm:py-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300/80">Secure Voting</p>
                        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">{election?.title ?? 'Election'}</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Your vote is private and encrypted.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700">
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                        Mobile-ready
                    </div>
                </div>
                <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 mt-[2px]" />
                    <span>You may skip any position. Unanswered positions will be submitted as blank.</span>
                </div>
            </div>

            {/* Progress */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4 sm:px-5 shadow-sm">
                <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                    <span>Progress</span>
                    <span>{doneCount}/{total} positions</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pb-24 sm:pb-8">
                {positionsWithCandidates.map((position) => {
                    const isOpen = expanded.has(position.id);
                    const selectedId = choices[position.id];

                    return (
                        <div
                            key={position.id}
                            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
                        >
                            <button
                                type="button"
                                onClick={() => toggle(position.id)}
                                className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4"
                                aria-expanded={isOpen}
                                aria-controls={`pos-${position.id}`}
                            >
                                <div className="flex flex-col items-start">
                                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300/80">Position</p>
                                    <span className="text-lg font-semibold">{position.name}</span>
                                    {selectedId && (
                                        <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                                            <Check className="w-4 h-4" /> Selected
                                        </span>
                                    )}
                                </div>
                                <div className="text-gray-600 dark:text-gray-300">
                                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </button>

                            {isOpen && (
                                <div id={`pos-${position.id}`} className="px-4 pb-4 sm:px-5 sm:pb-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {position.candidates?.map((candidate) => {
                                            const active = selectedId === candidate.id;
                                            return (
                                                <label
                                                    key={candidate.id}
                                                    onClick={(e) => {
                                                        if (active) {
                                                            e.preventDefault();
                                                            selectCandidate(position.id, candidate.id); // will unselect
                                                        }
                                                    }}
                                                    className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
                                                        active
                                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`position-${position.id}`}
                                                        value={candidate.id}
                                                        className="peer sr-only"
                                                        checked={active}
                                                        onChange={() => selectCandidate(position.id, candidate.id)}
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="p-4 flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold
                                                                    ${active ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                                                    {candidate.name?.slice(0, 2)?.toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-base font-semibold">{candidate.name}</p>
                                                                    {candidate.partylist?.name && (
                                                                        <p className="text-xs text-emerald-700 dark:text-emerald-300">{candidate.partylist.name}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {active && (
                                                                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-200 text-xs font-semibold">
                                                                    <Check className="w-4 h-4" /> Chosen
                                                                </span>
                                                            )}
                                                        </div>
                                                        {candidate.description && (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                {candidate.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                        {(!position.candidates || position.candidates.length === 0) && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300">No candidates available.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Sticky submit */}
                <div className="fixed left-0 right-0 bottom-0 z-20 sm:static sm:z-auto">
                    <div className="px-4 pb-4 sm:px-0 sm:pb-0">
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg sm:shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <span>Review choices before submitting.</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all
                                        ${!isSubmitting
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                            : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

VotingForm.layout = (page) => {
    const { election } = page.props;
    const header = (
        <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-300/80">Secure Voting</span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {election?.title ?? 'Election'}
                </h2>
            </div>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};