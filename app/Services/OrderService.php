<?php

namespace App\Services;

use App\Contracts\Repositories\OrderRepositoryInterface;
use App\Http\Resources\OrderCollection;
use App\Http\Resources\OrderResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class OrderService
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository
    ) {}

    /**
     * Get paginated orders with filters
     */
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        return $this->orderRepository->getPaginated($filters);
    }

    /**
     * Get orders as resource collection
     */
    public function getPaginatedAsResource(array $filters = []): OrderCollection
    {
        $orders = $this->getPaginated($filters);
        return new OrderCollection($orders);
    }

    /**
     * Find order by ID with trashed records
     */
    public function findWithTrashed(int $id)
    {
        return $this->orderRepository->findWithTrashed($id);
    }

    /**
     * Find order as resource
     */
    public function findAsResource(int $id): ?OrderResource
    {
        $order = $this->findWithTrashed($id);
        return $order ? new OrderResource($order) : null;
    }

    /**
     * Create a new order
     */
    public function create(array $data)
    {
        return $this->orderRepository->create($data);
    }

    /**
     * Create order and return as resource
     */
    public function createAsResource(array $data): OrderResource
    {
        $order = $this->create($data);
        return new OrderResource($order);
    }

    /**
     * Update an existing order
     */
    public function update(int $id, array $data): bool
    {
        return $this->orderRepository->update($id, $data);
    }

    /**
     * Update order and return as resource
     */
    public function updateAsResource(int $id, array $data): ?OrderResource
    {
        $updated = $this->update($id, $data);
        if (!$updated) {
            return null;
        }

        return $this->findAsResource($id);
    }

    /**
     * Delete an order
     */
    public function delete(int $id): bool
    {
        return $this->orderRepository->delete($id);
    }

    /**
     * Restore a soft-deleted order
     */
    public function restore(int $id): bool
    {
        return $this->orderRepository->restore($id);
    }

    /**
     * Force delete an order
     */
    public function forceDelete(int $id): bool
    {
        return $this->orderRepository->forceDelete($id);
    }
} 