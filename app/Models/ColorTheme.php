<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ColorTheme extends Model
{
    protected $fillable = ['name', 'image_path'];

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }
}
