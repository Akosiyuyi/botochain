import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuidelineItem from '@/Components/GuidelineItem';
import { BookUser, AlertCircle, CheckCircle, Shield, Lock, Mail, Eye, Users, Calendar, AlertTriangle, Zap } from 'lucide-react';

export default function Guidelines() {
    const guidelines = [
        {
            icon: Shield,
            title: "Eligibility",
            description: "Only registered students of the institution are allowed to vote using the EBOTO system.",
        },
        {
            icon: Lock,
            title: "Vote Once Only",
            description: "Each student can vote only once during the election period. Multiple entries will not be counted.",
        },
        {
            icon: Mail,
            title: "Login Credentials",
            description: "Use your registered email address to log in to the system.",
        },
        {
            icon: AlertTriangle,
            title: "Protect Your Credentials",
            description: "Do not share your login credentials with anyone to ensure the integrity of your vote.",
        },
        {
            icon: Eye,
            title: "Review Candidates",
            description: "Review all candidates and their platforms carefully before casting your vote.",
        },
        {
            icon: CheckCircle,
            title: "Complete Your Ballot",
            description: "Make sure to select a candidate for each position before submitting your ballot.",
        },
        {
            icon: AlertCircle,
            title: "Final Verification",
            description: "Votes cannot be changed once submitted. Double-check your selections before finalizing.",
        },
        {
            icon: Users,
            title: "Maintain Confidentiality",
            description: "Maintain confidentiality. Do not disclose your chosen candidates to others during the election process.",
        },
        {
            icon: Calendar,
            title: "Official Schedule",
            description: "Voting must be done within the official election schedule. Late submissions will not be accepted.",
        },
        {
            icon: Zap,
            title: "Technical Issues",
            description: "Report any technical issues immediately to the election committee or system administrator.",
        },
    ];

    return (
        <div>
            {/* Header Section */}
            <div className="rounded-xl mb-6 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-4 sm:px-6 py-6 sm:py-8 shadow-lg">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <BookUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">
                            Important Voter Guidelines
                        </h3>
                        <p className="text-sm text-white/90">
                            Please read and understand these guidelines to ensure a smooth voting experience
                        </p>
                    </div>
                </div>
            </div>

            {/* Guidelines Container */}
            <div className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 shadow-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-3 sm:gap-4">
                    {guidelines.map((guideline, idx) => (
                        <GuidelineItem
                            key={idx}
                            number={idx + 1}
                            icon={guideline.icon}
                            title={guideline.title}
                            description={guideline.description}
                        />
                    ))}
                </div>

                {/* Footer Notice */}
                <div className="mt-6 backdrop-blur-sm bg-green-50/80 dark:bg-green-900/20 rounded-xl border border-green-300 dark:border-green-700 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Ready to vote?</span> Make sure you've reviewed all guidelines before proceeding to cast your vote.
                        </p>
                    </div>
                </div>
                {/* add Caritas Christi Urget Nos here */}
                <div className="mt-6 text-center text-xl text-gray-500 dark:text-gray-400 italic">
                    Caritas Christi Urget Nos
                </div>
            </div>
        </div>
    );
}

Guidelines.layout = (page) => {
    const header = (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BookUser className="w-6 h-6 sm:w-7 sm:h-7" />
                Voting Guidelines
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Essential information and rules to follow during the voting process
            </p>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};