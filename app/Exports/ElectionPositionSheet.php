<?php

namespace App\Exports;

use App\Models\Election;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ElectionPositionSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    public function __construct(private Election $election)
    {
    }

    public function array(): array
    {
        $data = [];

        foreach ($this->election->positions as $position) {
            $positionTotalVotes = $this->election->results()
                ->where('position_id', $position->id)
                ->sum('vote_count');

            $eligibleForPosition = $this->election->eligibleVoters()
                ->where('position_id', $position->id)
                ->distinct()
                ->count('student_id');

            // Sort candidates by vote count
            $candidates = $position->candidates()
                ->with('partylist')
                ->get()
                ->map(function ($candidate) use ($positionTotalVotes) {
                    $votes = $this->election->results()
                        ->where('candidate_id', $candidate->id)
                        ->sum('vote_count');

                    return [
                        'name' => $candidate->name,
                        'partylist' => $candidate->partylist?->name ?? 'Independent',
                        'votes' => $votes,
                        'percentage' => $positionTotalVotes > 0
                            ? round(($votes / $positionTotalVotes) * 100, 2)
                            : 0,
                    ];
                })
                ->sortByDesc('votes');

            $data[] = [
                'position' => $position->name,
                'eligible_voters' => $eligibleForPosition,
                'total_votes' => $positionTotalVotes,
                'turnout' => $eligibleForPosition > 0
                    ? round(($positionTotalVotes / $eligibleForPosition) * 100, 2) . '%'
                    : '0%',
                'winner' => $candidates->first()['name'] ?? 'N/A',
                'winner_votes' => $candidates->first()['votes'] ?? 0,
            ];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Position',
            'Eligible Voters',
            'Total Votes',
            'Turnout',
            'Leading Candidate',
            'Votes Received',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '10B981'],
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Position Breakdown';
    }
}
