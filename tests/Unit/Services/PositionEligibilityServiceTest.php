<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\SchoolUnit;
use App\Services\PositionEligibilityService;
use Illuminate\Support\Facades\DB;

class PositionEligibilityServiceTest extends TestCase
{
    use RefreshDatabase;

    private PositionEligibilityService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(PositionEligibilityService::class);
    }

    private function seedSchoolLevelsWithIds(): void
    {
        DB::table('school_levels')->insert([
            ['id' => 1, 'name' => 'Grade School'],
            ['id' => 2, 'name' => 'Junior High'],
            ['id' => 3, 'name' => 'Senior High'],
            ['id' => 4, 'name' => 'College'],
        ]);
    }

    public function test_resolve_unit_ids_filters_by_year_levels()
    {
        $this->seedSchoolLevelsWithIds();

        $unit1 = SchoolUnit::factory()->create([
            'school_level_id' => 1,
            'year_level' => 'Grade 1',
            'course' => null,
        ]);
        $unit2 = SchoolUnit::factory()->create([
            'school_level_id' => 1,
            'year_level' => 'Grade 2',
            'course' => null,
        ]);

        $result = $this->service->resolveUnitIds([1], ['Grade 1'], []);

        $this->assertTrue($result->contains($unit1->id));
        $this->assertFalse($result->contains($unit2->id));
    }

    public function test_resolve_unit_ids_requires_courses_for_senior_high_and_college()
    {
        $this->seedSchoolLevelsWithIds();

        $stem = SchoolUnit::factory()->create([
            'school_level_id' => 3,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
        $abm = SchoolUnit::factory()->create([
            'school_level_id' => 3,
            'year_level' => 'Grade 11',
            'course' => 'ABM',
        ]);

        $result = $this->service->resolveUnitIds([3], ['Grade 11'], ['STEM']);

        $this->assertTrue($result->contains($stem->id));
        $this->assertFalse($result->contains($abm->id));
    }
}
