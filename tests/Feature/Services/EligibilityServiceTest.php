<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\ElectionSetup;
use App\Models\EligibleVoter;
use App\Models\Position;
use App\Models\PositionEligibleUnit;
use App\Models\SchoolLevel;
use App\Models\SchoolUnit;
use App\Models\Student;
use App\Services\EligibilityService;
use App\Services\ElectionViewService;

class EligibilityServiceTest extends TestCase
{
    use RefreshDatabase;

    private EligibilityService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
        $this->service = app(EligibilityService::class);
    }

    private function createElectionWithSetup(): Election
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create([
            'election_id' => $election->id,
        ]);
        return $election->load('setup');
    }

    public function test_eligible_voters_aggregation_by_school_level_year_course()
    {
        $election = $this->createElectionWithSetup();

        $schoolLevel = SchoolLevel::factory()->create(['name' => 'Senior High']);
        $unitStem = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
        $unitAbm = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'ABM',
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);

        PositionEligibleUnit::factory()->create([
            'position_id' => $position->id,
            'school_unit_id' => $unitStem->id,
        ]);

        $eligibleStudent = Student::factory()->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        $wrongCourseStudent = Student::factory()->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'ABM',
        ]);

        $unenrolledStudent = Student::factory()->create([
            'status' => 'Unenrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        $this->service->aggregateForElection($election);

        $this->assertDatabaseHas('eligible_voters', [
            'election_id' => $election->id,
            'position_id' => $position->id,
            'student_id' => $eligibleStudent->id,
        ]);

        $this->assertDatabaseMissing('eligible_voters', [
            'election_id' => $election->id,
            'position_id' => $position->id,
            'student_id' => $wrongCourseStudent->id,
        ]);

        $this->assertDatabaseMissing('eligible_voters', [
            'election_id' => $election->id,
            'position_id' => $position->id,
            'student_id' => $unenrolledStudent->id,
        ]);
    }

    public function test_ineligible_voters_cannot_see_position()
    {
        $election = $this->createElectionWithSetup();

        $schoolLevel = SchoolLevel::factory()->create(['name' => 'Senior High']);
        $stemUnit = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
        $abmUnit = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'ABM',
        ]);

        $positionStem = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);
        $positionAbm = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'Vice President',
        ]);

        PositionEligibleUnit::factory()->create([
            'position_id' => $positionStem->id,
            'school_unit_id' => $stemUnit->id,
        ]);
        PositionEligibleUnit::factory()->create([
            'position_id' => $positionAbm->id,
            'school_unit_id' => $abmUnit->id,
        ]);

        $stemStudent = Student::factory()->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        $this->service->aggregateForElection($election);

        $viewService = app(ElectionViewService::class);
        $payload = $viewService->forShow($election, $stemStudent);

        $positions = collect($payload['setup']['positions']);
        $positionIds = $positions->pluck('id')->toArray();

        $this->assertTrue(in_array($positionStem->id, $positionIds));
        $this->assertFalse(in_array($positionAbm->id, $positionIds));
    }
}
