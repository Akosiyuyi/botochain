<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ElectionSetup extends Model
{
    use HasFactory;

    protected $table = 'election_setup'; // Explicit since it's not plural

    protected $fillable = [
        'election_id',
        'theme_id',
        'setup_positions',
        'setup_partylist',
        'setup_candidates',
        'setup_finalized',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'setup_positions' => 'boolean',
        'setup_partylist' => 'boolean',
        'setup_candidates' => 'boolean',
        'setup_finalized' => 'boolean',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function colorTheme()
    {
        return $this->belongsTo(ColorTheme::class, 'theme_id');
    }

    public function refreshSetupFlags(): void
    {
        $this->setup_positions = $this->election->positions()->count() > 0;
        $this->setup_partylist = $this->election->partylists()->count() > 0;
        $this->setup_candidates = $this->election->candidates()->count() > 0;

        // Reset finalized if any flag goes false
        if (!($this->setup_positions && $this->setup_partylist && $this->setup_candidates)) {
            $this->setup_finalized = false;
        }

        $this->saveQuietly();
    }

    public function canFinalize(): bool
    {
        return $this->setup_positions
            && $this->setup_partylist
            && $this->setup_candidates
            && $this->start_time
            && $this->end_time;
    }
}
