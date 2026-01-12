<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\ElectionStatus;

class Election extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'status',
        'final_hash',
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
