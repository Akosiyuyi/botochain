<?php

namespace App\Enums;

enum ElectionStatus: string
{
    case Draft = 'draft';
    case Upcoming = 'upcoming';
    case Ongoing = 'ongoing';
    case Ended = 'ended';

    /**
     * Return all values as array for validation or select options.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Check if status is active (upcoming or ongoing).
     */
    public function isActive(): bool
    {
        return in_array($this, [self::Upcoming, self::Ongoing], true);
    }
}
