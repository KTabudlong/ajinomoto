<?php

namespace App\Services;

use App\Contracts\Repositories\SubjectRepositoryInterface;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class SubjectService
{
    public function __construct(
        private SubjectRepositoryInterface $repository
    ) {}

    /**
     * Get paginated subjects for authenticated tutor
     */
    public function getPaginatedForCurrentTutor(array $filters = [], array $with = []): LengthAwarePaginator
    {
        $tutorId = Auth::id();
        return $this->repository->getPaginatedForTutor($tutorId, $filters, $with);
    }

    /**
     * Get all subjects for authenticated tutor
     */
    public function getAllForCurrentTutor(array $filters = [], array $with = []): Collection
    {
        $tutorId = Auth::id();
        return $this->repository->getAllForTutor($tutorId, $filters, $with);
    }

    /**
     * Find subject by ID for authenticated tutor
     */
    public function findByIdForCurrentTutor(int $id, array $with = []): ?Subject
    {
        $subject = $this->repository->findById($id, $with);
        
        if (!$subject || $subject->tutor_id !== Auth::id()) {
            return null;
        }

        return $subject;
    }

    /**
     * Create a new subject for authenticated tutor
     */
    public function createForCurrentTutor(array $data): Subject
    {
        $data['tutor_id'] = Auth::id();
        return $this->repository->create($data);
    }

    /**
     * Update subject for authenticated tutor
     */
    public function updateForCurrentTutor(int $id, array $data): bool
    {
        $subject = $this->findByIdForCurrentTutor($id);
        
        if (!$subject) {
            return false;
        }

        return $this->repository->update($subject, $data);
    }

    /**
     * Delete subject for authenticated tutor
     */
    public function deleteForCurrentTutor(int $id): bool
    {
        $subject = $this->findByIdForCurrentTutor($id);
        
        if (!$subject) {
            return false;
        }

        if ($this->repository->hasDependencies($subject)) {
            return false;
        }

        return $this->repository->delete($subject);
    }

    /**
     * Restore subject for authenticated tutor
     */
    public function restoreForCurrentTutor(int $id): bool
    {
        $subject = $this->repository->findById($id);
        
        if (!$subject || $subject->tutor_id !== Auth::id()) {
            return false;
        }

        return $this->repository->restore($subject);
    }

    /**
     * Check if subject has dependencies
     */
    public function hasDependencies(int $id): bool
    {
        $subject = $this->findByIdForCurrentTutor($id);
        
        if (!$subject) {
            return false;
        }

        return $this->repository->hasDependencies($subject);
    }

    /**
     * Get subjects for API consumption
     */
    public function getActiveForApi(): Collection
    {
        return $this->repository->getActiveForApi();
    }

    /**
     * Toggle subject status for authenticated tutor
     */
    public function toggleStatusForCurrentTutor(int $id, string $field): bool
    {
        $subject = $this->findByIdForCurrentTutor($id);
        
        if (!$subject) {
            return false;
        }

        $subject->update([$field => !$subject->$field]);
        return $subject->$field;
    }

    /**
     * Get success message for actions
     */
    public function getSuccessMessage(string $action): string
    {
        return "Subject {$action} successfully.";
    }

    /**
     * Get dependency error message
     */
    public function getDependencyErrorMessage(): string
    {
        return "Cannot delete subject with existing topics. Please delete topics first.";
    }
} 