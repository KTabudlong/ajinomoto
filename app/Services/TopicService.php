<?php

namespace App\Services;

use App\Contracts\Repositories\TopicRepositoryInterface;
use App\Http\Resources\TopicCollection;
use App\Http\Resources\TopicResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class TopicService
{
    public function __construct(
        private TopicRepositoryInterface $topicRepository
    ) {}

    /**
     * Get paginated topics with filters
     */
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        return $this->topicRepository->getPaginated($filters);
    }

    /**
     * Get topics as resource collection
     */
    public function getPaginatedAsResource(array $filters = []): TopicCollection
    {
        try {
            $topics = $this->getPaginated($filters);
            
            // Debug logging
            Log::info('TopicService::getPaginatedAsResource - topics data:', [
                'type' => get_class($topics),
                'count' => method_exists($topics, 'count') ? $topics->count() : 'N/A',
                'filters' => $filters
            ]);
            
            return new TopicCollection($topics);
        } catch (\Exception $e) {
            Log::error('TopicService::getPaginatedAsResource - error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }



    /**
     * Find topic by ID with trashed records
     */
    public function findWithTrashed(int $id)
    {
        return $this->topicRepository->findWithTrashed($id);
    }

    /**
     * Find topic as resource
     */
    public function findAsResource(int $id): ?TopicResource
    {
        $topic = $this->findWithTrashed($id);
        return $topic ? new TopicResource($topic) : null;
    }

    /**
     * Create a new topic
     */
    public function create(array $data)
    {
        return $this->topicRepository->create($data);
    }

    /**
     * Create topic and return as resource
     */
    public function createAsResource(array $data): TopicResource
    {
        $topic = $this->create($data);
        return new TopicResource($topic);
    }

    /**
     * Update an existing topic
     */
    public function update(int $id, array $data): bool
    {
        return $this->topicRepository->update($id, $data);
    }

    /**
     * Update topic and return as resource
     */
    public function updateAsResource(int $id, array $data): ?TopicResource
    {
        $updated = $this->update($id, $data);
        if (!$updated) {
            return null;
        }

        return $this->findAsResource($id);
    }

    /**
     * Delete a topic
     */
    public function delete(int $id): bool
    {
        return $this->topicRepository->delete($id);
    }

    /**
     * Restore a soft-deleted topic
     */
    public function restore(int $id): bool
    {
        return $this->topicRepository->restore($id);
    }

    /**
     * Force delete a topic
     */
    public function forceDelete(int $id): bool
    {
        return $this->topicRepository->forceDelete($id);
    }
} 