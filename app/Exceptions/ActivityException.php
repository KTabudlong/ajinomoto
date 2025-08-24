<?php

namespace App\Exceptions;

use Exception;

class ActivityException extends Exception
{
    protected $code = 422;

    public static function validationFailed(string $message): self
    {
        return new self($message, 422);
    }

    public static function notFound(int $id): self
    {
        return new self("Activity with ID {$id} not found", 404);
    }

    public static function accessDenied(): self
    {
        return new self("You don't have permission to access this activity", 403);
    }

    public static function creationFailed(string $message = 'Failed to create activity'): self
    {
        return new self($message, 500);
    }

    public static function updateFailed(string $message = 'Failed to update activity'): self
    {
        return new self($message, 500);
    }

    public static function deletionFailed(string $message = 'Failed to delete activity'): self
    {
        return new self($message, 500);
    }
}
