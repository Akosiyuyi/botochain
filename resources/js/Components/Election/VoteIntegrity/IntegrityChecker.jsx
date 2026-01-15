import { useState } from 'react';
import { BadgeCheck, AlertCircle, ShieldCheck, Copy, Download, ChevronDown } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function IntegrityChecker({ election, vote = null, isVoter = false }) {
    const [showDetails, setShowDetails] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [date, setDate] = useState(null);

    const handleVerify = async () => {
        setVerifying(true);
        setShowDetails(false);
        try {
            const route = vote
                ? `/election/${election.id}/vote/${vote.id}/verify`
                : `/election/${election.id}/verify`;

            const response = await fetch(route);
            const data = await response.json();
            setResult(data);
            setDate(new Date().toLocaleString());
        } catch (error) {
            console.error('Verification failed', error);
            setResult({ valid: false, reason: 'Verification failed - Network error' });
            setDate(new Date().toLocaleString());
        } finally {
            setVerifying(false);
        }
    };

    const handleCopyReport = () => {
        if (result) {
            const text = JSON.stringify(result, null, 2);
            navigator.clipboard.writeText(text);
        }
    };

    const handleDownloadReport = () => {
        if (result) {
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2)));
            element.setAttribute('download', `${isVoter ? 'vote' : 'election'}-verification-${Date.now()}.json`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    };

    // Show initial CTA if no result and not verifying
    if (!result && !verifying) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                {isVoter ? 'Verify Your Vote' : 'Election Integrity Verification'}
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            {isVoter
                                ? 'Ensure your vote hasn\'t been tampered with by verifying its cryptographic signature.'
                                : 'Verify the integrity of all votes in this election through blockchain validation.'}
                        </p>
                    </div>
                    <PrimaryButton
                        onClick={handleVerify}
                        disabled={verifying}
                        className="whitespace-nowrap w-full sm:w-auto text-sm flex items-center justify-center"
                    >
                        {verifying ? 'Verifying...' : 'Start Verification'}
                    </PrimaryButton>
                </div>
            </div>
        );
    }

    // Guard clause - if still verifying but no result yet
    if (verifying && !result) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="animate-spin flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Verifying...</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Please wait while we verify the election integrity.</p>
                    </div>
                </div>
            </div>
        );
    }

    // If result exists, display it
    if (!result) {
        return null;
    }

    const isValid = result.valid === true;
    const hasVotes = result.total_votes > 0;

    return (
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {/* Main Status Card */}
            <div className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${isValid
                ? 'border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                : 'border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
                }`}>
                <div className="p-4 sm:p-6">
                    <div onClick={() => setShowDetails(!showDetails)}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            {isValid ? (
                                <>
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/50">
                                            <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base sm:text-lg font-bold text-green-900 dark:text-green-200 break-words">
                                            {isVoter ? 'Your Vote is Safe' : 'Election Verified'}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1">
                                            Verified at {date}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base sm:text-lg font-bold text-red-900 dark:text-red-200 break-words">
                                            Integrity Issue Detected
                                        </h3>
                                        <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1 break-words">
                                            {result.reason || 'Verification failed'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            className={`flex-shrink-0 p-2 rounded-lg transition-all ${isValid
                                ? 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                                }`}
                            aria-label={showDetails ? 'Hide details' : 'Show details'}
                        >
                            <ChevronDown
                                className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Expandable Details */}
                {showDetails && (
                    <div className={`border-t-2 ${isValid ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'} px-4 sm:px-6 py-4 bg-white/50 dark:bg-black/20 space-y-4`}>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Vote ID - Only for voters */}
                            {isVoter && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Vote ID</p>
                                    <p className="text-sm font-mono font-bold text-gray-900 dark:text-white mt-2 truncate" title={result.vote_id || 'N/A'}>
                                        {result.vote_id || 'Not available'}
                                    </p>
                                </div>
                            )}

                            {/* Total Verified - Only show when no votes */}
                            {!hasVotes && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Verified</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                                        0 votes
                                    </p>
                                </div>
                            )}

                            {/* Votes Cast - Show when votes exist */}
                            {hasVotes && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Votes Cast</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                                        {result.total_votes}
                                    </p>
                                </div>
                            )}

                            {/* Chain Status */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Chain Status</p>
                                <p className={`text-sm font-bold mt-2 ${result.final_hash
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {result.final_hash ? '✓ Valid Chain' : 'No chain yet'}
                                </p>
                            </div>
                        </div>

                        {/* Hash Display */}
                        <div className="space-y-3">
                            {/* Final Hash */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                                    Final Hash
                                </label>
                                {result.final_hash ? (
                                    <code className="block bg-gray-900 dark:bg-black text-green-400 p-2 sm:p-3 rounded-lg text-xs break-all font-mono overflow-x-auto border border-gray-700">
                                        {result.final_hash}
                                    </code>
                                ) : (
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-600 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">No hash available - No votes cast yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Payload Hash */}
                            {result.expected_payload_hash && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                                        Payload Hash
                                    </label>
                                    <code className="block bg-gray-900 dark:bg-black text-yellow-400 p-2 sm:p-3 rounded-lg text-xs break-all font-mono overflow-x-auto border border-gray-700">
                                        {result.expected_payload_hash}
                                    </code>
                                </div>
                            )}

                            {/* Previous Hash */}
                            {result.previous_hash && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                                        Previous Hash
                                    </label>
                                    <code className="block bg-gray-900 dark:bg-black text-blue-400 p-2 sm:p-3 rounded-lg text-xs break-all font-mono overflow-x-auto border border-gray-700">
                                        {result.previous_hash}
                                    </code>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleCopyReport}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            >
                                <Copy className="w-4 h-4 flex-shrink-0" />
                                <span>Copy Report</span>
                            </button>
                            <button
                                onClick={handleDownloadReport}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                            >
                                <Download className="w-4 h-4 flex-shrink-0" />
                                <span>Download</span>
                            </button>
                            <PrimaryButton
                                onClick={() => setResult(null)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
                            >
                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                <span>Verify Again</span>
                            </PrimaryButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}