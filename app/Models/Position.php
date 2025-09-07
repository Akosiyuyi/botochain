<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $fillable = [
        'election_id',
        'name',
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }
}
