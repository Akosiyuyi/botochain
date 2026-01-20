<?php

namespace App\Http\Controllers\Admin;

use App\Exports\ElectionResultsExport;
use App\Exports\ElectionSummaryExport;
use App\Models\Election;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;

class ElectionExportController extends Controller
{
    /**
     * Export election results as Excel
     */
    public function exportExcel(Election $election)
    {
        $filename = "election-results-{$election->id}-" . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(
            new ElectionSummaryExport($election),
            $filename
        );
    }

    /**
     * Export election results as PDF
     */
    public function exportPdf(Election $election)
    {
        $votesCast = $election->votes()->count();
        $eligibleVoters = $election->eligibleVoters()->distinct()->count('student_id');
        
        $positions = $election->positions()->with(['candidates.partylist'])->get()->map(function ($position) use ($election) {
            $candidates = $position->candidates->map(function ($candidate) use ($election) {
                $votes = $election->votes()
                    ->whereHas('voteDetails', function ($query) use ($candidate) {
                        $query->where('candidate_id', $candidate->id);
                    })
                    ->count();
                
                return [
                    'name' => $candidate->name,
                    'partylist' => $candidate->partylist?->name ?? 'Independent',
                    'votes' => $votes,
                ];
            })->sortByDesc('votes');

            return [
                'name' => $position->name,
                'candidates' => $candidates,
                'total_votes' => $candidates->sum('votes'),
            ];
        });

        $pdf = Pdf::loadView('exports.election-pdf', [
            'election' => $election,
            'positions' => $positions,
            'votesCast' => $votesCast,
            'eligibleVoters' => $eligibleVoters,
            'turnout' => $eligibleVoters > 0 ? round(($votesCast / $eligibleVoters) * 100, 2) : 0,
        ]);

        return $pdf->download("election-results-{$election->id}.pdf");
    }
}
