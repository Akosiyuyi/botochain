<?php

namespace App\Exports;

use App\Models\Election;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ElectionSummarySheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    public function __construct(private Election $election)
    {
    }

    public function array(): array
    {
        $votesCast = $this->election->results()->sum('vote_count');
        $eligibleVoters = $this->election->eligibleVoters()->distinct()->count('student_id');
        $turnoutRate = $eligibleVoters > 0 ? round(($votesCast / $eligibleVoters) * 100, 2) : 0;

        return [
            ['Election Title', $this->election->title],
            ['Status', $this->election->status->value ?? $this->election->status],
            ['Start Date', $this->election->setup?->start_time ? $this->election->setup->start_time->toFormattedDateString() : 'N/A'],
            ['End Date', $this->election->setup?->end_time ? $this->election->setup->end_time->toFormattedDateString() : 'N/A'],
            [],
            ['Total School Levels', $this->election->schoolLevels->count()],
            ['Total Positions', $this->election->positions->count()],
            ['Total Candidates', $this->election->candidates->count()],
            ['Total Partylists', $this->election->partylists->count()],
            [],
            ['Eligible Voters', $eligibleVoters],
            ['Votes Cast', $votesCast],
            ['Turnout Rate', $turnoutRate . '%'],
        ];
    }

    public function headings(): array
    {
        return ['Metric', 'Value'];
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
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '10B981']
                ],

            ],
            'A:A' => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Summary';
    }
}
