<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ElectionResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'position_id',
        'candidate_id',
        'vote_count',
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    protected static function booted()
    {
        static::updating(function (ElectionResult $result) {
            if ($result->election->status === \App\Enums\ElectionStatus::Finalized) {
                return false; // prevent update when finalized
            }
        });

        static::deleting(function (ElectionResult $result) {
            if ($result->election->status === \App\Enums\ElectionStatus::Finalized) {
                return false; // prevent delete when finalized
            }
        });
    }
}
