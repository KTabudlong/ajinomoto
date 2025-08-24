<?php

namespace App\Repositories;

use App\Contracts\Repositories\OrderRepositoryInterface;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderRepository implements OrderRepositoryInterface
{
    /**
     * Get paginated orders with filters and sorting
     */
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        $query = Order::with(['subject', 'customer', 'schedule', 'orderStatus']);

        $this->applyFilters($query, $filters);
        $this->applySorting($query, $filters);

        return $query->paginate(15)->appends(request()->all());
    }

    /**
     * Find order by ID with trashed records
     */
    public function findWithTrashed(int $id)
    {
        return Order::withTrashed()->with(['subject', 'customer', 'schedule', 'orderStatus'])->find($id);
    }

    /**
     * Create a new order
     */
    public function create(array $data)
    {
        return Order::create($data);
    }

    /**
     * Update an existing order
     */
    public function update(int $id, array $data): bool
    {
        $order = Order::find($id);
        if (!$order) {
            return false;
        }
        
        return $order->update($data);
    }

    /**
     * Delete an order (soft delete)
     */
    public function delete(int $id): bool
    {
        $order = Order::find($id);
        if (!$order) {
            return false;
        }
        
        return $order->delete();
    }

    /**
     * Restore a soft-deleted order
     */
    public function restore(int $id): bool
    {
        $order = Order::withTrashed()->find($id);
        if (!$order) {
            return false;
        }
        
        return $order->restore();
    }

    /**
     * Force delete an order
     */
    public function forceDelete(int $id): bool
    {
        $order = Order::withTrashed()->find($id);
        if (!$order) {
            return false;
        }
        
        return $order->forceDelete();
    }

    /**
     * Apply filters to the query
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        // Apply search filter
        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->whereHas('subject', fn($sq) => $sq->where('name', 'like', "%{$filters['search']}%"))
                  ->orWhereHas('customer', fn($cq) => $cq->where(function($cq2) use ($filters) {
                      $cq2->where('first_name', 'like', "%{$filters['search']}%")
                          ->orWhere('last_name', 'like', "%{$filters['search']}%")
                          ->orWhere('email', 'like', "%{$filters['search']}%");
                  }));
            });
        }

        // Apply trashed filter
        if (!empty($filters['trashed'])) {
            if ($filters['trashed'] === 'with') {
                $query->withTrashed();
            } elseif ($filters['trashed'] === 'only') {
                $query->onlyTrashed();
            }
        }

        // Apply role-based filtering
        if (!empty($filters['user_role_id']) && !empty($filters['user_id'])) {
            if ($filters['user_role_id'] == 2) {
                // Tutor: show orders for their subjects
                $query->whereHas('subject', function ($q) use ($filters) {
                    $q->where('tutor_id', $filters['user_id']);
                });
            } elseif ($filters['user_role_id'] == 3) {
                // Customer: show their own orders
                $query->where('customer_id', $filters['user_id']);
            }
            // Super admin (role_id == 1): see all orders
        }
    }

    /**
     * Apply sorting to the query
     */
    private function applySorting(Builder $query, array $filters): void
    {
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Handle relationship sorting
        if ($this->isRelationshipSort($sortBy)) {
            $this->applyRelationshipSort($query, $sortBy, $sortOrder);
        } else {
            // Handle direct column sorting
            $this->applyDirectSort($query, $sortBy, $sortOrder);
        }
    }

    /**
     * Check if the sort field is a relationship
     */
    private function isRelationshipSort(string $sortBy): bool
    {
        return in_array($sortBy, ['subject', 'customer', 'schedule', 'order_status']);
    }

    /**
     * Apply relationship-based sorting
     */
    private function applyRelationshipSort(Builder $query, string $sortBy, string $sortOrder): void
    {
        switch ($sortBy) {
            case 'subject':
                $query->join('subjects', 'orders.subject_id', '=', 'subjects.id')
                    ->orderBy('subjects.name', $sortOrder)
                    ->select('orders.*');
                break;

            case 'customer':
                $query->join('users', 'orders.customer_id', '=', 'users.id')
                    ->orderBy('users.first_name', $sortOrder)
                    ->select('orders.*');
                break;

            case 'schedule':
                $query->join('schedules', 'orders.schedule_id', '=', 'schedules.id')
                    ->orderBy('schedules.start_time', $sortOrder)
                    ->select('orders.*');
                break;

            case 'order_status':
                $query->join('order_statuses', 'orders.order_status_id', '=', 'order_statuses.id')
                    ->orderBy('order_statuses.name', $sortOrder)
                    ->select('orders.*');
                break;
        }
    }

    /**
     * Apply direct column sorting
     */
    private function applyDirectSort(Builder $query, string $sortBy, string $sortOrder): void
    {
        $allowedSortFields = ['created_at', 'updated_at', 'customer_id', 'subject_id', 'topic_id', 'schedule_id'];
        
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            // Default fallback
            $query->orderBy('created_at', 'desc');
        }
    }

    /**
     * Get allowed sort fields for validation
     */
    public function getAllowedSortFields(): array
    {
        return ['created_at', 'updated_at', 'customer_id', 'subject_id', 'topic_id', 'schedule_id'];
    }

    /**
     * Get default sort field
     */
    public function getDefaultSortBy(): string
    {
        return 'created_at';
    }

    /**
     * Get default sort order
     */
    public function getDefaultSortOrder(): string
    {
        return 'desc';
    }
} 