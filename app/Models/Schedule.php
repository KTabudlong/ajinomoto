<?php
namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schedule extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'batch_id',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time'   => 'datetime',
        ];
    }

    // Define searchable columns for the Searchable trait
    protected array $searchableColumns = [
        'batch_id',
        'start_time',
        'end_time',
    ];

    // scopes
    public function scopeOrderByStartTime($query)
    {
        $query->orderBy('start_time');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('start_time', 'like', '%' . $search . '%')
                    ->orWhere('end_time', 'like', '%' . $search . '%')
                    ->orWhere('batch_id', 'like', '%' . $search . '%');
            });
        })
            ->when($filters['trashed'] ?? null, function ($query, $trashed) {
                if ($trashed === 'with') {
                    $query->withTrashed();
                } elseif ($trashed === 'only') {
                    $query->onlyTrashed();
                }
            })
            ->when($filters['year'] ?? null, function ($query, $year) {
                $query->whereYear('start_time', $year);
            })
            ->when($filters['month'] ?? null, function ($query, $month) {
                $query->whereMonth('start_time', $month);
            })
            ->when($filters['day'] ?? null, function ($query, $day) {
                $query->whereDay('start_time', $day);
            });
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class);
    }
}
