<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DayColor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'day_of_week',
        'hex_color',
        'is_active',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the day color.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active day colors.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get system default day colors (no user_id).
     */
    public function scopeSystemDefaults($query)
    {
        return $query->whereNull('user_id');
    }

    /**
     * Get day colors for a specific user or system defaults.
     */
    public static function getForUser(?int $userId = null)
    {
        if ($userId) {
            $userColors = static::where('user_id', $userId)->active()->get();
            if ($userColors->isNotEmpty()) {
                return $userColors;
            }
        }
        
        // Fall back to system defaults
        return static::systemDefaults()->active()->get();
    }

    /**
     * Get day colors as an associative array with hex values.
     */
    public static function getColorsArray(?int $userId = null): array
    {
        $colors = static::getForUser($userId);
        $colorsArray = [];
        
        foreach ($colors as $color) {
            $colorsArray[$color->day_of_week] = $color->hex_color;
        }
        
        return $colorsArray;
    }

    /**
     * Get day colors as an associative array with Tailwind classes.
     */
    public static function getTailwindColorsArray(?int $userId = null): array
    {
        $colors = static::getForUser($userId);
        $colorsArray = [];
        
        foreach ($colors as $color) {
            $colorsArray[$color->day_of_week] = $color->getTailwindClass();
        }
        
        return $colorsArray;
    }

    /**
     * Convert hex color to Tailwind class (approximate mapping).
     */
    public function getTailwindClass(): string
    {
        // Map common hex colors to Tailwind classes
        $colorMap = [
            '#3B82F6' => 'bg-blue-500',    // Blue
            '#EF4444' => 'bg-red-500',     // Red
            '#10B981' => 'bg-green-500',   // Green
            '#F59E0B' => 'bg-yellow-500',  // Yellow
            '#8B5CF6' => 'bg-purple-500',  // Purple
            '#F97316' => 'bg-orange-500',  // Orange
            '#EC4899' => 'bg-pink-500',    // Pink
            '#6366F1' => 'bg-indigo-500',  // Indigo
            '#06B6D4' => 'bg-cyan-500',    // Cyan
            '#84CC16' => 'bg-lime-500',    // Lime
            '#F43F5E' => 'bg-rose-500',    // Rose
            '#A855F7' => 'bg-violet-500',  // Violet
        ];

        return $colorMap[$this->hex_color] ?? 'bg-gray-500'; // Default fallback
    }

    /**
     * Get CSS style attribute for the hex color.
     */
    public function getCssStyle(): string
    {
        return "background-color: {$this->hex_color};";
    }

    /**
     * Validate hex color format.
     */
    public static function isValidHexColor(string $hex): bool
    {
        return preg_match('/^#[0-9A-F]{6}$/i', $hex);
    }
} 