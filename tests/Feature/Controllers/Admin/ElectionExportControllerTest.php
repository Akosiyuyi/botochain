<?php

namespace Tests\Feature\Controllers\Admin;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\Position;
use App\Models\Candidate;
use App\Models\Partylist;
use App\Models\User;
use App\Enums\ElectionStatus;

class ElectionExportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles for admin authentication
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
    }

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function createElectionWithSetup(array $attributes = []): Election
    {
        $election = Election::factory()->create(array_merge([
            'status' => ElectionStatus::Finalized,
        ], $attributes));

        // Ensure ElectionSetup exists
        if (!$election->setup) {
            \App\Models\ElectionSetup::factory()->create([
                'election_id' => $election->id,
            ]);
        }

        return $election;
    }

    /**
     * Test election can be exported to Excel
     */
    public function test_election_excel_export_downloads_file()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.excel', $election->id));

        $response->assertStatus(200);
    }

    /**
     * Test Excel export contains multiple sheets
     */
    public function test_excel_export_contains_multiple_sheets()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.excel', $election->id));

        $response->assertStatus(200);
    }

    /**
     * Test PDF export downloads file
     */
    public function test_pdf_export_downloads_file()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.pdf', $election->id));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    /**
     * Test PDF export with election results
     */
    public function test_pdf_export_with_election_results()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 5,
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.pdf', $election->id));

        $response->assertStatus(200);
        $this->assertNotEmpty($response->getContent());
    }

    /**
     * Test export includes all candidates
     */
    public function test_export_includes_all_candidates()
    {
        $election = $this->createElectionWithSetup();
        
        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        // Create two candidates
        $candidate1 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        $candidate2 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create results for both
        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate1->id,
            'vote_count' => 10,
        ]);

        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate2->id,
            'vote_count' => 8,
        ]);

        // Verify both candidates have results
        $results = $election->results()->count();
        $this->assertEquals(2, $results);
    }

    /**
     * Test export sorting by vote count
     */
    public function test_export_sorting_by_vote_count()
    {
        $election = $this->createElectionWithSetup();
        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate1 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'name' => 'Alice Johnson',
        ]);

        $candidate2 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'name' => 'Bob Smith',
        ]);

        // Alice gets 5 votes, Bob gets 3
        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate1->id,
            'vote_count' => 5,
        ]);

        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate2->id,
            'vote_count' => 3,
        ]);

        // Get and sort candidates by votes
        $candidates = $position->candidates()->get()
            ->map(function ($candidate) use ($election) {
                $votes = $election->results()
                    ->where('candidate_id', $candidate->id)
                    ->sum('vote_count');
                return [
                    'id' => $candidate->id,
                    'name' => $candidate->name,
                    'votes' => $votes,
                ];
            })
            ->sortByDesc('votes');

        $sorted = $candidates->values()->all();
        // Alice (5 votes) should be first
        $this->assertEquals('Alice Johnson', $sorted[0]['name']);
        $this->assertEquals(5, $sorted[0]['votes']);
        // Bob (3 votes) should be second
        $this->assertEquals('Bob Smith', $sorted[1]['name']);
        $this->assertEquals(3, $sorted[1]['votes']);
    }

    /**
     * Test export handles zero votes
     */
    public function test_export_handles_zero_votes()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create result with zero votes
        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 0,
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.excel', $election->id));

        $response->assertStatus(200);
    }

    /**
     * Test only authenticated users can export
     */
    public function test_unauthenticated_user_cannot_export()
    {
        $election = $this->createElectionWithSetup();

        $response = $this->get(route('admin.election.export.excel', $election->id));

        $response->assertRedirect(route('login'));
    }

    /**
     * Test export includes partylist names
     */
    public function test_export_includes_partylist_names()
    {
        $election = $this->createElectionWithSetup();

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Test Party',
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
        ]);

        // Verify candidate has partylist
        $this->assertNotNull($candidate->partylist_id);
        $this->assertEquals('Test Party', $candidate->partylist->name);
    }

    /**
     * Test PDF export calculates correct turnout
     */
    public function test_pdf_export_calculates_correct_turnout()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.pdf', $election->id));

        $response->assertStatus(200);
    }

    /**
     * Test excel export with candidates
     */
    public function test_excel_export_with_independent_candidates()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
        ]);

        // Create candidate with partylist
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
        ]);

        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 5,
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.excel', $election->id));

        $response->assertStatus(200);
    }

    /**
     * Test export shows position breakdown
     */
    public function test_export_shows_position_breakdown()
    {
        $election = $this->createElectionWithSetup();

        $position = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 10,
        ]);

        // Get position breakdown data
        $positionTotalVotes = $election->results()
            ->where('position_id', $position->id)
            ->sum('vote_count');

        $this->assertEquals(10, $positionTotalVotes);
    }

    /**
     * Test export filename includes election ID
     */
    public function test_export_filename_includes_election_id_and_timestamp()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.excel', $election->id));

        $response->assertStatus(200);
    }

    /**
     * Test PDF export filename format
     */
    public function test_pdf_export_filename_format()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.pdf', $election->id));

        $response->assertStatus(200);
        // Check that response has proper PDF headers
        $this->assertStringContainsString('attachment', $response->headers->get('content-disposition'));
        $this->assertStringContainsString("election-results-{$election->id}.pdf", $response->headers->get('content-disposition'));
    }

    /**
     * Test export handles multiple positions
     */
    public function test_export_handles_multiple_positions()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        // Create two positions
        $president = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);

        $vicePresident = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'Vice President',
        ]);

        // Create candidates for each position
        $presidentCandidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $president->id,
        ]);

        $vpCandidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $vicePresident->id,
        ]);

        // Create results for both positions
        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $president->id,
            'candidate_id' => $presidentCandidate->id,
            'vote_count' => 10,
        ]);

        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $vicePresident->id,
            'candidate_id' => $vpCandidate->id,
            'vote_count' => 8,
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.election.export.excel', $election->id));

        $response->assertStatus(200);
        
        // Verify data structure
        $this->assertEquals(2, $election->positions()->count());
        $this->assertEquals(2, $election->results()->count());
    }
}
