<?php

namespace App\Http\Controllers;

use App\Http\Requests\TopicRequest;
use App\Models\Topic;
use App\Services\TopicService;
use App\Traits\HasCrudOperations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TopicController extends Controller
{
    use HasCrudOperations;

    public function __construct(
        private TopicService $topicService
    ) {}

    // Configuration properties
    protected string $modelClass = Topic::class;
    protected string $resourceClass = \App\Http\Resources\TopicResource::class;
    protected string $resourceName = 'topics';
    protected array $dependencies = [];
    protected array $defaultRelationships = [];

    // Abstract method implementations
    protected function getModel(): string
    {
        return $this->modelClass;
    }

    protected function getIndexView(): string
    {
        return 'Topics/Index';
    }

    protected function getCreateView(): string
    {
        return 'Topics/Create';
    }

    protected function getEditView(): string
    {
        return 'Topics/Edit';
    }

    protected function getShowView(): string
    {
        return 'Topics/Show';
    }

    protected function getIndexRoute(): string
    {
        return 'topics';
    }

    protected function getResourceName(): string
    {
        return $this->resourceName;
    }

    // Override sorting methods for topics
    protected function getDefaultSortBy(): string
    {
        return 'name';
    }

    protected function getDefaultSortOrder(): string
    {
        return 'asc';
    }

    protected function getAllowedSortFields(): array
    {
        return ['name', 'description', 'sort_order', 'created_at', 'updated_at'];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'sort_by', 'sort_order', 'trashed']);
        
        try {
            $topics = $this->topicService->getPaginatedAsResource($filters);
            
            // Debug logging
            Log::info('TopicController::index - topics data:', [
                'type' => get_class($topics),
                'data' => $topics,
                'filters' => $filters
            ]);
            
            return Inertia::render('Topics/Index', [
                'topics' => $topics,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            Log::error('TopicController::index - error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return empty data structure to prevent frontend crash
            return Inertia::render('Topics/Index', [
                'topics' => [
                    'data' => [],
                    'meta' => [],
                    'links' => [],
                    'filters' => []
                ],
                'filters' => $filters,
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Topics/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TopicRequest $request)
    {
        $data = $request->validated();
        
        $topic = $this->topicService->createAsResource($data);

        return redirect()->route('topics.index')
            ->with('success', 'Topic created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Topic $topic): Response
    {
        $topicResource = $this->topicService->findAsResource($topic->id);

        return Inertia::render('Topics/Show', [
            'topic' => $topicResource,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Topic $topic): Response
    {
        $topicWithTrashed = $this->topicService->findWithTrashed($topic->id);

        return Inertia::render('Topics/Edit', [
            'topic' => $topicWithTrashed,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TopicRequest $request, Topic $topic)
    {
        $data = $request->validated();
        
        $updatedTopic = $this->topicService->updateAsResource($topic->id, $data);

        return redirect()->route('topics.edit', $topic)
            ->with('success', 'Topic updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Topic $topic)
    {
        $this->topicService->delete($topic->id);

        return redirect()->route('topics.index')
            ->with('success', 'Topic deleted successfully.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(Topic $topic)
    {
        $this->topicService->restore($topic->id);

        return redirect()->route('topics.index')
            ->with('success', 'Topic restored successfully.');
    }
}
