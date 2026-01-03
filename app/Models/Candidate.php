<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    protected $fillable = [
        'election_id',
        'partylist_id',
        'position_id',
        'name',
        'description,'
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function partylist()
    {
        return $this->belongsTo(Partylist::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }
}
