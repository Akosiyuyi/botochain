<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'name',
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function eligibleUnits()
    {
        return $this->hasMany(PositionEligibleUnit::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }

    public function eligibleVoters()
    {
        return $this->hasMany(EligibleVoter::class);
    }

    public function voteDetails()
    {
        return $this->hasMany(VoteDetail::class);
    }

    public function results()
    {
        return $this->hasMany(ElectionResult::class);
    }

}
