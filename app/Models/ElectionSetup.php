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

    public function theme()
    {
        return $this->belongsTo(ColorTheme::class, 'theme_id');
    }
}
