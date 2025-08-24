<?php
namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

// Email blast related models
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'contact',
        'email',
        'password',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',

            'password'          => 'hashed',
        ];
    }

    public function getNameAttribute()
    {
        $firstName = $this->first_name ?: '';
        $lastName  = $this->last_name ?: '';
        $fullName  = trim($firstName . ' ' . $lastName);

        return $fullName ?: $this->email;
    }

    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::needsRehash($password) ? Hash::make($password) : $password;
    }

    // scopes
    public function scopeOrderByName($query)
    {
        $query->orderBy('last_name')->orderBy('first_name');
    }

    // public function scopeWhereRole($query, $role)
    // {
    //     switch ($role) {
    //         case 'user': return $query->where('owner', false);
    //         case 'owner': return $query->where('owner', true);
    //     }
    // }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        })
        // ->when($filters['role'] ?? null, function ($query, $role) {
        //     $query->whereRole($role);
        // })
            ->when($filters['trashed'] ?? null, function ($query, $trashed) {
                if ($trashed === 'with') {
                    $query->withTrashed();
                } elseif ($trashed === 'only') {
                    $query->onlyTrashed();
                }
            });
    }

    // ORM
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }



    // Schedule settings relationships
    public function timeSlots(): HasMany
    {
        return $this->hasMany(TimeSlot::class);
    }

    public function dayColors(): HasMany
    {
        return $this->hasMany(DayColor::class);
    }

    public function timeFormat(): HasMany
    {
        return $this->hasMany(TimeFormat::class);
    }

    public function slotDuration(): HasMany
    {
        return $this->hasMany(SlotDuration::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        // For now, we'll use a simple email-based check
        // In a real application, you might have a roles table or admin flag
        $adminEmails = [
            'admin@example.com',
            'admin@company.com',
        ];
        
        return in_array($this->email, $adminEmails);
    }
}
