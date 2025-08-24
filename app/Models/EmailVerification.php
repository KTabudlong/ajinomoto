<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EmailVerification extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'code',
        'expires_at',
        'is_used',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeValid($query)
    {
        return $query->where('is_used', false)
                    ->where('expires_at', '>', now());
    }

    public function scopeForEmail($query, string $email)
    {
        return $query->where('email', $email);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Helper methods
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired();
    }

    public function markAsUsed(): void
    {
        $this->update([
            'is_used' => true,
            'used_at' => now(),
        ]);
    }

    public static function generateCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public static function createVerification(string $email, ?int $userId = null): self
    {
        return self::create([
            'user_id' => $userId,
            'email' => $email,
            'code' => self::generateCode(),
            'expires_at' => now()->addMinutes(5),
            'is_used' => false,
        ]);
    }
}
