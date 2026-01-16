<?php

namespace App\Exports;

use App\Models\Election;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ElectionSummaryExport implements WithMultipleSheets
{
    public function __construct(private Election $election) {}

    public function sheets(): array
    {
        return [
            'Summary' => new ElectionSummarySheet($this->election),
            'Detailed Results' => new ElectionResultsExport($this->election),
            'Position Breakdown' => new ElectionPositionSheet($this->election),
        ];
    }
}
