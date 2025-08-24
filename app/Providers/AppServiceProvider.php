<?php
namespace App\Providers;

use App\Models\AdminSettings;
use App\Policies\AdminSettingsPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Model;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register repository bindings
        $this->app->bind(
            \App\Contracts\Repositories\TopicRepositoryInterface::class,
            \App\Repositories\TopicRepository::class
        );
        
        $this->app->bind(
            \App\Contracts\Repositories\AdminSettingsRepositoryInterface::class,
            \App\Repositories\AdminSettingsRepository::class
        );

        // Register new activity system bindings
        $this->app->bind(
            \App\Contracts\Repositories\ActivityRepositoryInterface::class,
            \App\Repositories\ActivityRepository::class
        );

        // Register service bindings
        $this->app->bind(
            \App\Services\ActivityService::class,
            \App\Services\ActivityService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        JsonResource::withoutWrapping();

        // Register policies
        $this->registerPolicies();
        $this->bootRoute();
    }

    public function registerPolicies(): void
    {

        Gate::policy(AdminSettings::class, AdminSettingsPolicy::class);
    }

    public function bootRoute(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
