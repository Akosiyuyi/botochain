<?php

namespace App\Exports;

use App\Models\Election;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ElectionResultsExport implements FromArray, WithHeadings, WithStyles
{
    public function __construct(private Election $election)
    {
    }

    public function array(): array
    {
        $data = [];

        foreach ($this->election->positions as $position) {
            foreach ($position->candidates as $candidate) {
                $votes = $this->election->results()
                    ->where('candidate_id', $candidate->id)
                    ->sum('vote_count');

                $data[] = [
                    'Position' => $position->name,
                    'Candidate Name' => $candidate->name,
                    'Party List' => $candidate->partylist?->name ?? 'N/A',
                    'Votes Received' => $votes,
                    'Percentage' => $position->position_total_votes > 0
                        ? round(($votes / $position->position_total_votes) * 100, 2)
                        : 0,
                ];
            }
            $data[] = []; // Blank row between positions
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Position',
            'Candidate Name',
            'Party List',
            'Votes Received',
            'Percentage (%)',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => '10B981'],
                ],

            ],
        ];
    }
}
