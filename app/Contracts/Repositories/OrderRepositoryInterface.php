<?php

namespace App\Contracts\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function getPaginated(array $filters = []): LengthAwarePaginator;
    public function findWithTrashed(int $id);
    public function create(array $data);
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function restore(int $id): bool;
    public function forceDelete(int $id): bool;
} 