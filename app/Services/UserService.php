<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    /**
     * Create a new user with proper role assignment
     */
    public function createUser(array $userData, string $authType): User
    {
        // Split name into first and last name
        $nameParts = explode(' ', trim($userData['name']), 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        $userData = [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $userData['email'],
            'password' => Hash::make($userData['password']),
            'role_id' => $this->getRoleIdForAuthType($authType),
        ];

        $user = $this->userRepository->create($userData);

        event(new Registered($user));

        return $user;
    }

    /**
     * Get the appropriate role ID based on authentication type
     */
    private function getRoleIdForAuthType(string $authType): int
    {
        return match ($authType) {
            'admin' => Role::TUTOR,
            default => Role::CUSTOMER,
        };
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }

    /**
     * Find user by ID
     */
    public function findById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    /**
     * Get users by role
     */
    public function getByRole(int $roleId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->userRepository->getByRole($roleId);
    }

    /**
     * Update user
     */
    public function update(User $user, array $data): bool
    {
        return $this->userRepository->update($user, $data);
    }

    /**
     * Delete user
     */
    public function delete(User $user): bool
    {
        return $this->userRepository->delete($user);
    }
}
