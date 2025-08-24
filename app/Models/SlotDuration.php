<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SlotDuration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'duration_minutes',
        'is_active',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the slot duration.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active slot durations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get super admin default slot duration (user_id = 1).
     */
    public function scopeSuperAdminDefaults($query)
    {
        return $query->where('user_id', 1);
    }

    /**
     * Get slot duration for a specific user or system default.
     */
    public static function getForUser(?int $userId = null)
    {
        if ($userId) {
            $userDuration = static::where('user_id', $userId)->active()->first();
            if ($userDuration) {
                return $userDuration;
            }
        }
        
        // Fall back to system default (null user_id)
        return static::whereNull('user_id')->active()->first() ?? static::create([
            'user_id' => null,
            'duration_minutes' => 60,
            'is_active' => true
        ]);
    }

    /**
     * Get duration value for a specific user or system default.
     */
    public static function getDuration(?int $userId = null): int
    {
        $duration = static::getForUser($userId);
        return $duration->duration_minutes;
    }

    /**
     * Get formatted duration string.
     */
    public function getFormattedDurationAttribute(): string
    {
        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;
        
        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }
} 