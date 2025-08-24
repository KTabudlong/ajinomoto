<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeFormat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'format',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the time format.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active time formats.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get system default time format (no user_id).
     */
    public function scopeSystemDefaults($query)
    {
        return $query->whereNull('user_id');
    }

    /**
     * Get time format for a specific user or system default.
     */
    public static function getForUser(?int $userId = null)
    {
        if ($userId) {
            $userFormat = static::where('user_id', $userId)->active()->first();
            if ($userFormat) {
                return $userFormat;
            }
        }
        
        // Fall back to system default
        return static::systemDefaults()->active()->first() ?? static::create([
            'format' => '24h',
            'is_active' => true
        ]);
    }

    /**
     * Get format value for a specific user or system default.
     */
    public static function getFormat(?int $userId = null): string
    {
        $format = static::getForUser($userId);
        return $format->format;
    }
} 