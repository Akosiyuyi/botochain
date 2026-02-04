<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\ElectionStatus;

/**
 * @property int $id
 * @property string $title
 * @property ElectionStatus $status
 * @property string|null $final_hash
 * @property \Carbon\Carbon|null $finalized_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */

class Election extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'status',
        'final_hash',
        'finalized_at',
    ];

    protected $attributes = [
        'status' => 'draft',
    ];

    protected $casts = [
        'status' => ElectionStatus::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship to ElectionSetup 
    public function setup()
    {
        return $this->hasOne(ElectionSetup::class);
    }

    // Relationship to SchoolLevels
    public function schoolLevels()
    {
        return $this->hasMany(ElectionSchoolLevel::class);
    }

    public function positions()
    {
        return $this->hasMany(Position::class);
    }

    public function partylists()
    {
        return $this->hasMany(Partylist::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }

    public function eligibleVoters()
    {
        return $this->hasMany(EligibleVoter::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function results()
    {
        return $this->hasMany(ElectionResult::class);
    }

    // Helper: get school_levels as plain array
    public function getSchoolLevelListAttribute()
    {
        return $this->schoolLevels->pluck('school_level')->toArray();
    }
}
