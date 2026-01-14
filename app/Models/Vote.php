<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'student_id',
        'payload_hash',
        'previous_hash',
        'current_hash',
        'tallied',
    ];

    protected $casts = [
        'tallied' => 'boolean',
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function voteDetails()
    {
        return $this->hasMany(VoteDetail::class);
    }

    protected static function booted()
    {
        static::updating(function ($vote) {
            // If dirty fields are only "tallied", allow
            if ($vote->isDirty(['tallied']) && !$vote->isDirty(['payload_hash', 'previous_hash', 'current_hash'])) {
                return true;
            }

            // Block if hashes are being changed
            if ($vote->isDirty(['payload_hash', 'previous_hash', 'current_hash'])) {
                return false;
            }

            // Block everything else
            return false;
        });

        static::deleting(fn() => false);
    }

}
