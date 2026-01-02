<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partylist extends Model
{
    protected $fillable = [
        'election_id',
        'name',
        'description',
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }
}
