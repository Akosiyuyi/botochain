<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\EligibleVoter;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ElectionViewService
{
    /**
     * Get all elections.
     */
    public function list()
    {
        return Election::with('setup.colorTheme', 'schoolLevels.schoolLevel')
            ->get()
            ->map(fn(Election $election) => $this->formatElectionListItem($election));
    }

    /**
     * Get specified election details.
     */
    public function forShow(Election $election, $student = null)
    {
        $election = $this->loadRelationsForShow($election);
        [$displayDate, $displayTime] = $this->buildDisplayDateTime($election);

        return [
            'election' => $this->buildElectionMeta($election, $displayDate, $displayTime),
            'setup' => $this->buildSetup($election, $student),
            'schoolOptions' => $this->buildSchoolOptions($election),
            'results' => $this->buildResults($election),
        ];
    }

    /**
     * Get specified election editing details.
     */
    public function forEdit(Election $election)
    {
        $election->load('schoolLevels.schoolLevel');

        return [
            'id' => $election->id,
            'title' => $election->title,
            'school_levels' => $election->schoolLevels
                ->map(fn($esl) => $esl->schoolLevel->id)
                ->toArray(),
        ];
    }

    /**
     * Format a single election for list display.
     */
    public function formatElectionListItem(Election $election): array
    {
        [$displayDate] = $this->buildDisplayDateTime($election);

        return [
            'id' => $election->id,
            'title' => $election->title,
            'image_path' => $election->setup->colorTheme->image_url,
            'school_levels' => $election->schoolLevels
                ->map(fn($esl) => $esl->schoolLevel->name)
                ->toArray(),
            'status' => $election->status,
            'display_date' => $displayDate,
            'link' => route("admin.election.show", ['election' => $election->id]),
        ];
    }

    /**
     * Build setup section for forShow response.
     */
    private function buildSetup(Election $election, $student = null): array
    {
        return [
            'positions' => $this->getPositionsPayload($election, $student),
            'partylists' => $this->getPartylistsPayload($election),
            'candidates' => $this->getCandidatesPayload($election, $student),
            'schedule' => $this->buildSetupSchedule($election),
            'flags' => $this->buildSetupFlags($election),
        ];
    }

    /**
     * Build school options section for forShow response.
     */
    private function buildSchoolOptions(Election $election): array
    {
        [$partylistOptions, $positionOptions] = $this->getPartylistAndPositionOptions($election);

        return [
            'yearLevelOptions' => SchoolOptionsService::getYearLevelOptions(),
            'courseOptions' => SchoolOptionsService::getCourseOptions(),
            'partylistOptions' => $partylistOptions,
            'positionOptions' => $positionOptions,
        ];
    }

    /**
     * Build results section for forShow response.
     */
    private function buildResults(Election $election): array
    {
        $resultsRows = $election->results;
        $candidateVoteMap = $this->buildCandidateVoteMap($resultsRows);
        $eligibleCounts = $this->getEligibleCountsByPosition($election);

        $positionsPayload = $this->buildPositionsPayload($election, $candidateVoteMap, $eligibleCounts);
        $overallEligibleVoterCount = $this->getOverallEligibleVoterCount($election);
        $votesCast = (int) $election->votes()->count();
        $progressPercent = $overallEligibleVoterCount > 0
            ? round(($votesCast / $overallEligibleVoterCount) * 100, 2)
            : 0.0;

        return [
            'positions' => $positionsPayload,
            'metrics' => [
                'eligibleVoterCount' => (int) $overallEligibleVoterCount,
                'votesCast' => $votesCast,
                'progressPercent' => $progressPercent,
            ],
        ];
    }

    /**
     * Build a map of candidate ID to vote count.
     */
    private function buildCandidateVoteMap($resultsRows): array
    {
        return $resultsRows
            ->pluck('vote_count', 'candidate_id')
            ->map(fn($v) => (int) $v)
            ->toArray();
    }

    /**
     * Get eligible voter counts grouped by position.
     */
    private function getEligibleCountsByPosition(Election $election): array
    {
        return EligibleVoter::where('election_id', $election->id)
            ->select('position_id', DB::raw('COUNT(DISTINCT student_id) AS cnt'))
            ->groupBy('position_id')
            ->pluck('cnt', 'position_id')
            ->toArray();
    }

    /**
     * Get overall distinct eligible voter count for the election.
     */
    private function getOverallEligibleVoterCount(Election $election): int
    {
        return EligibleVoter::where('election_id', $election->id)
            ->distinct()
            ->count('student_id');
    }

    /**
     * Build positions payload with vote counts and percentages.
     */
    private function buildPositionsPayload(Election $election, array $candidateVoteMap, array $eligibleCounts): array
    {
        return $election->positions->map(function ($position) use ($candidateVoteMap, $eligibleCounts) {
            $candidates = $this->formatPositionCandidates($position, $candidateVoteMap);
            $positionTotal = collect($candidates)->sum(fn($c) => $c['vote_count']);

            $candidates = collect($candidates)
                ->map(fn($c) => [
                    ...$c,
                    'percent_of_position' => $positionTotal > 0 ? round(($c['vote_count'] / $positionTotal) * 100, 2) : 0,
                ])
                ->sortByDesc('vote_count')
                ->values()
                ->toArray();

            return [
                'id' => $position->id,
                'name' => $position->name,
                'candidates' => $candidates,
                'position_total_votes' => (int) $positionTotal,
                'eligible_voter_count' => (int) ($eligibleCounts[$position->id] ?? 0),
            ];
        })->values()->toArray();
    }

    /**
     * Format candidates for a position with vote counts.
     */
    private function formatPositionCandidates($position, array $candidateVoteMap): array
    {
        return $position->candidates
            ->map(fn($candidate) => [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'partylist' => $candidate->partylist?->name,
                'vote_count' => $candidateVoteMap[$candidate->id] ?? 0,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Format date string.
     */
    private function dateFormat($date): ?string
    {
        if (!$date) {
            return null;
        }

        $dt = $date instanceof Carbon ? $date : Carbon::parse($date);
        return $dt->format('M d, Y');
    }

    /**
     * Format time string.
     */
    private function timeFormat($time): ?string
    {
        if (!$time) {
            return null;
        }

        $dt = $time instanceof Carbon ? $time : Carbon::parse($time);
        return $dt->format('h:i A');
    }

    /**
     * Build display date and time based on election status.
     */
    private function buildDisplayDateTime(Election $election): array
    {
        $setup = $election->setup;
        $start = $setup?->start_time ? Carbon::parse($setup->start_time) : null;
        $end = $setup?->end_time ? Carbon::parse($setup->end_time) : null;

        return match ($election->status) {
            ElectionStatus::Draft => [
                $this->dateFormat($election->created_at),
                '',
            ],
            ElectionStatus::Upcoming => [
                $this->dateFormat($start) ?? $this->dateFormat($election->created_at),
                $this->timeFormat($start) ?? '',
            ],
            ElectionStatus::Ongoing => [
                $this->dateFormat($start) . ' → ' . $this->dateFormat($end),
                $this->timeFormat($start) . ' → ' . $this->timeFormat($end),
            ],
            ElectionStatus::Finalized => [
                $this->dateFormat($end) ?? $this->dateFormat($election->created_at),
                '',
            ],
            ElectionStatus::Compromised => [
                $this->dateFormat($end) ?? $this->dateFormat($election->created_at),
                '',
            ],
            default => [
                $this->dateFormat($election->created_at),
                '',
            ],
        };
    }

    /**
     * Load required relations for the show view.
     */
    private function loadRelationsForShow(Election $election): Election
    {
        return $election->load(
            'setup.colorTheme',
            'schoolLevels.schoolLevel',
            'positions.eligibleUnits.schoolUnit.schoolLevel',
            'positions.candidates.partylist',
            'partylists',
            'candidates.position',
            'candidates.partylist',
            'results.candidate.partylist',
            'results.position'
        );
    }

    /**
     * Build election meta information.
     */
    private function buildElectionMeta(Election $election, $displayDate, $displayTime): array
    {
        return [
            'id' => $election->id,
            'title' => $election->title,
            'image_path' => $election->setup->colorTheme->image_url,
            'school_levels' => $election->schoolLevels
                ->map(fn($esl) => [
                    'id' => $esl->schoolLevel->id,
                    'label' => $esl->schoolLevel->name,
                    'value' => $esl->schoolLevel->id,
                ])
                ->values()
                ->toArray(),
            'display_date' => $displayDate,
            'display_time' => $displayTime,
            'status' => $election->status,
        ];
    }

    /**
     * Get positions payload.
     */
    private function getPositionsPayload(Election $election, $student = null): array
    {
        $positions = $election->positions;
        
        // Filter positions by student eligibility if student is provided
        if ($student) {
            $eligiblePositionIds = EligibleVoter::where('election_id', $election->id)
                ->where('student_id', $student->id)
                ->pluck('position_id')
                ->toArray();
            
            $positions = $positions->filter(function ($position) use ($eligiblePositionIds) {
                return in_array($position->id, $eligiblePositionIds);
            });
        }

        return $positions->map(function ($position) {
            return [
                'id' => $position->id,
                'name' => $position->name,
                'school_levels' => $position->eligibleUnits
                    ->groupBy(fn($eu) => $eu->schoolUnit->school_level_id)
                    ->map(fn($units) => $this->formatSchoolLevelGroup($units))
                    ->values(),
            ];
        })->toArray();
    }

    /**
     * Format a group of eligible units by school level.
     */
    private function formatSchoolLevelGroup($units): array
    {
        $firstEu = $units->first();
        $schoolUnit = $firstEu->schoolUnit;
        $level = $schoolUnit->schoolLevel;

        return [
            'id' => $level->id,
            'label' => $level->name,
            'value' => $level->id,
            'units' => $units->map(fn($eu) => [
                'id' => $eu->schoolUnit->id,
                'year_level' => $eu->schoolUnit->year_level,
                'course' => $eu->schoolUnit->course,
            ])->values(),
        ];
    }

    /**
     * Get partylists payload.
     */
    private function getPartylistsPayload(Election $election): array
    {
        return $election->partylists->map(fn($partylist) => [
            'id' => $partylist->id,
            'name' => $partylist->name,
            'description' => $partylist->description,
        ])->toArray();
    }

    /**
     * Get candidates payload.
     */
    private function getCandidatesPayload(Election $election, $student = null): array
    {
        $candidates = $election->candidates;
        
        // Filter candidates by student eligibility if student is provided
        if ($student) {
            $eligiblePositionIds = EligibleVoter::where('election_id', $election->id)
                ->where('student_id', $student->id)
                ->pluck('position_id')
                ->toArray();
            
            $candidates = $candidates->filter(function ($candidate) use ($eligiblePositionIds) {
                return in_array($candidate->position_id, $eligiblePositionIds);
            });
        }

        return $candidates->map(fn($candidate) => [
            'id' => $candidate->id,
            'partylist' => [
                'id' => $candidate->partylist_id,
                'name' => $candidate->partylist?->name,
            ],
            'position' => [
                'id' => $candidate->position_id,
                'name' => $candidate->position?->name,
            ],
            'name' => $candidate->name,
            'description' => $candidate->description,
        ])->values()->toArray();
    }

    /**
     * Get partylist and position options.
     */
    private function getPartylistAndPositionOptions(Election $election): array
    {
        $partylistOptions = $election->partylists
            ->map(fn($p) => [
                'id' => $p->id,
                'label' => $p->name,
                'value' => $p->id,
            ])
            ->values()
            ->toArray();

        $positionOptions = $election->positions
            ->map(fn($pos) => [
                'id' => $pos->id,
                'label' => $pos->name,
                'value' => $pos->id,
            ])
            ->values()
            ->toArray();

        return [$partylistOptions, $positionOptions];
    }

    /**
     * Build setup schedule.
     */
    private function buildSetupSchedule(Election $election): array
    {
        $setup = $election->setup;

        return [
            'id' => $setup->id,
            'startDate' => $setup?->start_time ? Carbon::parse($setup->start_time)->toDateString() : null,
            'startTime' => $setup?->start_time ? Carbon::parse($setup->start_time)->format('H:i') : null,
            'endTime' => $setup?->end_time ? Carbon::parse($setup->end_time)->format('H:i') : null,
        ];
    }

    /**
     * Build setup flags.
     */
    private function buildSetupFlags(Election $election): array
    {
        $setup = $election->setup;

        return [
            'position' => $setup->setup_positions,
            'partylist' => $setup->setup_partylist,
            'candidate' => $setup->setup_candidates,
            'schedule' => ($setup?->start_time && $setup?->end_time) ? true : false,
        ];
    }
}