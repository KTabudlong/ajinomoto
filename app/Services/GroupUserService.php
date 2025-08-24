<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GroupUserService
{
    /**
     * Get customers for a tutor with search and sorting
     */
    public function getCustomersForTutor(int $tutorId, array $filters = []): Collection
    {
        $query = User::where('tutor_id', $tutorId)
            ->where('role_id', '!=', 1); // Exclude tutors

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        switch ($sortBy) {
            case 'name':
                $query->orderBy('first_name', $sortOrder)
                      ->orderBy('last_name', $sortOrder);
                break;
            case 'date_added':
                $query->orderBy('created_at', $sortOrder);
                break;
            default:
                $query->orderBy('first_name', 'asc')
                      ->orderBy('last_name', 'asc');
        }

        return $query->get();
    }

    /**
     * Get customers that are not already in the group
     */
    public function getAvailableCustomersForGroup(Group $group, array $filters = []): Collection
    {
        $customers = $this->getCustomersForTutor($group->tutor_id, $filters);
        
        // Filter out customers already in the group
        $existingUserIds = $group->users()->pluck('users.id')->toArray();
        
        return $customers->filter(function ($customer) use ($existingUserIds) {
            return !in_array($customer->id, $existingUserIds);
        });
    }



    /**
     * Get users for confirmation page
     */
    public function getUsersForConfirmation(array $userIds, int $tutorId): Collection
    {
        return User::whereIn('id', $userIds)
            ->where('tutor_id', $tutorId)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();
    }

    /**
     * Get users currently in a group
     */
    public function getUsersInGroup(Group $group, array $filters = []): Collection
    {
        $query = $group->users()
            ->where('tutor_id', $group->tutor_id);

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        switch ($sortBy) {
            case 'name':
                $query->orderBy('first_name', $sortOrder)
                      ->orderBy('last_name', $sortOrder);
                break;
            case 'email':
                $query->orderBy('email', $sortOrder);
                break;
            case 'date_added':
                // For date_added sorting, we need to handle it after getting the data
                // since we need to sort by pivot table data
                break;
            default:
                $query->orderBy('first_name', 'asc')
                      ->orderBy('last_name', 'asc');
        }

        $users = $query->get();

        // Handle date_added sorting after getting the data
        if ($sortBy === 'date_added') {
            $users = $users->sortBy(function ($user) use ($group, $sortOrder) {
                // Get the date when user was added to the group from pivot table
                $pivotData = DB::table('group_user')
                    ->where('group_id', $group->id)
                    ->where('user_id', $user->id)
                    ->first();
                
                if (!$pivotData) {
                    return $sortOrder === 'asc' ? '9999-12-31' : '1900-01-01';
                }
                return $pivotData->created_at;
            });
            
            if ($sortOrder === 'desc') {
                $users = $users->reverse();
            }
        }

        return $users;
    }

    /**
     * Get all customers for a tutor with their group membership status
     */
    public function getCustomersWithGroupStatus(Group $group, array $filters = []): Collection
    {
        $query = User::where('tutor_id', $group->tutor_id)
            ->where('role_id', '!=', 1); // Exclude tutors

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Get current group members with their join dates
        $currentMembers = DB::table('group_user')
            ->where('group_id', $group->id)
            ->join('users', 'group_user.user_id', '=', 'users.id')
            ->where('users.tutor_id', $group->tutor_id)
            ->select('users.id', 'group_user.created_at as date_added_to_group')
            ->get()
            ->keyBy('id');

        $currentMemberIds = $currentMembers->keys()->toArray();

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        switch ($sortBy) {
            case 'name':
                $query->orderBy('first_name', $sortOrder)
                      ->orderBy('last_name', $sortOrder);
                break;
            case 'email':
                $query->orderBy('email', $sortOrder);
                break;
            case 'date_added':
                // For date_added sorting, we need to handle it after getting the data
                // since we need to sort by pivot table data
                break;
            default:
                $query->orderBy('first_name', 'asc')
                      ->orderBy('last_name', 'asc');
        }

        $customers = $query->get();

        // Add group membership status to each customer
        $customers->each(function ($customer) use ($currentMemberIds, $currentMembers) {
            $customer->is_in_group = in_array($customer->id, $currentMemberIds);
            $customer->date_added_to_group = null;
            
            if ($customer->is_in_group && isset($currentMembers[$customer->id])) {
                $customer->date_added_to_group = $currentMembers[$customer->id]->date_added_to_group;
            }
        });

        // Handle date_added sorting after adding the date data
        if ($sortBy === 'date_added') {
            try {
                // Ensure we have customers to sort
                if ($customers->count() > 0) {
                    // Separate customers with dates and without dates
                    $customersWithDates = $customers->whereNotNull('date_added_to_group');
                    $customersWithoutDates = $customers->whereNull('date_added_to_group');
                    
                    // Sort customers with dates
                    if ($sortOrder === 'asc') {
                        $customersWithDates = $customersWithDates->sortBy('date_added_to_group');
                        $customers = $customersWithDates->merge($customersWithoutDates);
                    } else {
                        $customersWithDates = $customersWithDates->sortByDesc('date_added_to_group');
                        $customers = $customersWithoutDates->merge($customersWithDates);
                    }
                } else {
                    // No customers to sort - this is normal for empty groups
                }
            } catch (\Exception $e) {
                Log::error('GroupUserService: Error during date_added sorting', [
                    'group_id' => $group->id,
                    'error' => $e->getMessage(),
                    'filters' => $filters
                ]);
                
                // Fallback to default sorting if date_added sorting fails
                $customers = $customers->sortBy('first_name')->sortBy('last_name');
            }
        }

        return $customers;
    }

    /**
     * Manage group members (add new and remove existing)
     */
    public function manageGroupMembers(Group $group, array $selectedUserIds): array
    {
        $results = [
            'added' => 0,
            'removed' => 0,
            'errors' => 0,
            'details' => []
        ];

        try {
            DB::beginTransaction();

            $currentMemberIds = $this->getCurrentMemberIds($group);
            $changes = $this->calculateMemberChanges($selectedUserIds, $currentMemberIds);
            
            $this->addNewMembers($group, $changes['toAdd'], $results);
            $this->removeExistingMembers($group, $changes['toRemove'], $results);

            DB::commit();

            $this->logManagementCompletion($group, $results);

        } catch (\Exception $e) {
            DB::rollBack();
            $results['errors']++;
            
            $this->logManagementError($group, $selectedUserIds, $e);

            throw $e;
        }

        return $results;
    }

    /**
     * Get current member IDs for a group
     */
    private function getCurrentMemberIds(Group $group): array
    {
        return $group->users()->pluck('users.id')->toArray();
    }

    /**
     * Calculate which users to add and remove
     */
    private function calculateMemberChanges(array $selectedUserIds, array $currentMemberIds): array
    {
        return [
            'toAdd' => array_diff($selectedUserIds, $currentMemberIds),
            'toRemove' => array_diff($currentMemberIds, $selectedUserIds)
        ];
    }

    /**
     * Add new members to the group
     */
    private function addNewMembers(Group $group, array $userIds, array &$results): void
    {
        foreach ($userIds as $userId) {
            $user = $this->findValidUser($userId, $group->tutor_id);
            
            if ($user) {
                $this->attachUserToGroup($group, $user, $results);
            }
        }
    }

    /**
     * Remove existing members from the group
     */
    private function removeExistingMembers(Group $group, array $userIds, array &$results): void
    {
        foreach ($userIds as $userId) {
            $user = $this->findValidUser($userId, $group->tutor_id);
            
            if ($user) {
                $this->detachUserFromGroup($group, $user, $results);
            }
        }
    }

    /**
     * Find a valid user for the given tutor
     */
    private function findValidUser(int $userId, int $tutorId): ?User
    {
        return User::where('id', $userId)
            ->where('tutor_id', $tutorId)
            ->first();
    }

    /**
     * Attach a user to a group
     */
    private function attachUserToGroup(Group $group, User $user, array &$results): void
    {
        $group->users()->attach($user->id);
        $results['added']++;
        
        $results['details'][] = [
            'user_id' => $user->id,
            'email' => $user->email,
            'action' => 'added',
            'message' => 'User successfully added to group'
        ];

        $this->logUserAction($group, $user, 'added');
    }

    /**
     * Detach a user from a group
     */
    private function detachUserFromGroup(Group $group, User $user, array &$results): void
    {
        $group->users()->detach($user->id);
        $results['removed']++;
        
        $results['details'][] = [
            'user_id' => $user->id,
            'email' => $user->email,
            'action' => 'removed',
            'message' => 'User successfully removed from group'
        ];

        $this->logUserAction($group, $user, 'removed');
    }

    /**
     * Log user action (add/remove)
     */
    private function logUserAction(Group $group, User $user, string $action): void
    {
        Log::info("User {$action} to group", [
            'group_id' => $group->id,
            'group_name' => $group->name,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'tutor_id' => $group->tutor_id
        ]);
    }

    /**
     * Log management completion
     */
    private function logManagementCompletion(Group $group, array $results): void
    {
        Log::info('Group members management completed', [
            'group_id' => $group->id,
            'group_name' => $group->name,
            'added' => $results['added'],
            'removed' => $results['removed'],
            'errors' => $results['errors']
        ]);
    }

    /**
     * Log management error
     */
    private function logManagementError(Group $group, array $selectedUserIds, \Exception $e): void
    {
        Log::error('Error managing group members', [
            'group_id' => $group->id,
            'group_name' => $group->name,
            'selected_user_ids' => $selectedUserIds,
            'error' => $e->getMessage(),
            'tutor_id' => $group->tutor_id
        ]);
    }
} 