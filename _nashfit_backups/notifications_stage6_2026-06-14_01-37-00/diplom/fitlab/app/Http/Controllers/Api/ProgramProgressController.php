<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Services\ActivityService;

class ProgramProgressController extends Controller
{
    public function index(Request $request)
    {
        $items = ProgramProgress::query()
            ->where('user_id', $request->user()->id)
            ->with(['program.trainer'])
            ->latest('last_activity_at')
            ->latest('updated_at')
            ->get();

        $serialized = $items->map(fn (ProgramProgress $progress) => $this->serialize($progress));

        return response()->json([
            'data' => $serialized,
            'summary' => [
                'total' => $items->count(),
                'active' => $items->where('status', 'active')->count(),
                'paused' => $items->where('status', 'paused')->count(),
                'completed' => $items->where('status', 'completed')->count(),
                'average_progress' => $items->isEmpty()
                    ? 0
                    : (int) round($serialized->avg('progress_percent')),
            ],
        ]);
    }

    public function show(Request $request, Program $program)
    {
        $progress = ProgramProgress::query()
            ->where('user_id', $request->user()->id)
            ->where('program_id', $program->id)
            ->with(['program.trainer'])
            ->first();

        return response()->json([
            'progress' => $progress ? $this->serialize($progress) : null,
        ]);
    }

    public function start(Request $request, Program $program)
    {
        $progress = ProgramProgress::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'program_id' => $program->id,
            ],
            [
                'completed_weeks' => 0,
                'status' => 'active',
                'started_at' => now(),
                'last_activity_at' => now(),
            ]
        );

        if (!$progress->started_at) {
            $progress->forceFill([
                'started_at' => now(),
                'last_activity_at' => now(),
            ])->save();
        }

        if ($progress->wasRecentlyCreated) {
            app(ActivityService::class)->notifyUser($request->user(), 'program.started', 'Программа начата', 'Вы начали программу «' . $program->title . '».', '/account/programs', $progress, ['program_id' => $program->id], $request->user()->id, 'target');
        }

        return response()->json([
            'message' => 'Программа добавлена в профиль.',
            'progress' => $this->serialize($progress->load(['program.trainer'])),
        ], $progress->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, Program $program)
    {
        $data = $request->validate([
            'action' => [
                'required',
                'string',
                Rule::in(['advance', 'rollback', 'pause', 'resume', 'restart', 'complete']),
            ],
        ]);

        $progress = DB::transaction(function () use ($request, $program, $data) {
            $progress = ProgramProgress::query()
                ->where('user_id', $request->user()->id)
                ->where('program_id', $program->id)
                ->lockForUpdate()
                ->first();

            if (!$progress) {
                $progress = ProgramProgress::create([
                    'user_id' => $request->user()->id,
                    'program_id' => $program->id,
                    'completed_weeks' => 0,
                    'status' => 'active',
                    'started_at' => now(),
                    'last_activity_at' => now(),
                ]);
            }

            $totalWeeks = max(1, (int) ($program->duration_weeks ?: 1));
            $completedWeeks = (int) $progress->completed_weeks;
            $status = $progress->status;
            $completedAt = $progress->completed_at;
            $startedAt = $progress->started_at ?: now();

            switch ($data['action']) {
                case 'advance':
                    $completedWeeks = min($totalWeeks, $completedWeeks + 1);
                    $status = $completedWeeks >= $totalWeeks ? 'completed' : 'active';
                    $completedAt = $status === 'completed' ? now() : null;
                    break;

                case 'rollback':
                    $completedWeeks = max(0, $completedWeeks - 1);
                    $status = 'active';
                    $completedAt = null;
                    break;

                case 'pause':
                    if ($status !== 'completed') {
                        $status = 'paused';
                    }
                    break;

                case 'resume':
                    $status = $completedWeeks >= $totalWeeks ? 'completed' : 'active';
                    break;

                case 'restart':
                    $completedWeeks = 0;
                    $status = 'active';
                    $startedAt = now();
                    $completedAt = null;
                    break;

                case 'complete':
                    $completedWeeks = $totalWeeks;
                    $status = 'completed';
                    $completedAt = now();
                    break;
            }

            $progress->forceFill([
                'completed_weeks' => $completedWeeks,
                'status' => $status,
                'started_at' => $startedAt,
                'completed_at' => $completedAt,
                'last_activity_at' => now(),
            ])->save();

            return $progress->load(['program.trainer']);
        });

        $message = match ($data['action']) {
            'advance' => $progress->status === 'completed' ? 'Программа завершена' : 'Прогресс обновлён',
            'complete' => 'Программа завершена',
            'pause' => 'Программа поставлена на паузу',
            'resume' => 'Программа продолжена',
            'restart' => 'Программа начата заново',
            default => 'Прогресс обновлён',
        };
        app(ActivityService::class)->event($request->user(), 'user', 'program.progress', $message, 'Программа «' . $program->title . '»: ' . $progress->completed_weeks . ' из ' . max(1, (int) ($program->duration_weeks ?: 1)) . ' недель.', '/account/programs', $progress, ['program_id' => $program->id, 'status' => $progress->status], $request->user()->id);

        return response()->json([
            'message' => 'Прогресс обновлён.',
            'progress' => $this->serialize($progress),
        ]);
    }

    public function destroy(Request $request, Program $program)
    {
        ProgramProgress::query()
            ->where('user_id', $request->user()->id)
            ->where('program_id', $program->id)
            ->delete();

        return response()->json([
            'message' => 'Программа удалена из профиля.',
        ]);
    }

    private function serialize(ProgramProgress $progress): array
    {
        $program = $progress->program;
        $totalWeeks = max(1, (int) ($program?->duration_weeks ?: 1));
        $completedWeeks = min($totalWeeks, max(0, (int) $progress->completed_weeks));
        $percent = (int) round(($completedWeeks / $totalWeeks) * 100);

        return [
            'id' => $progress->id,
            'status' => $progress->status,
            'completed_weeks' => $completedWeeks,
            'total_weeks' => $totalWeeks,
            'current_week' => $progress->status === 'completed'
                ? $totalWeeks
                : min($totalWeeks, $completedWeeks + 1),
            'progress_percent' => $percent,
            'started_at' => $progress->started_at?->toISOString(),
            'completed_at' => $progress->completed_at?->toISOString(),
            'last_activity_at' => $progress->last_activity_at?->toISOString(),
            'program' => $program ? [
                'id' => $program->id,
                'title' => $program->title,
                'description' => $program->description,
                'level' => $program->level,
                'duration_weeks' => $program->duration_weeks,
                'price' => 0,
                'is_free' => true,
                'image_url' => $program->image_url,
                'trainer' => $program->trainer ? [
                    'id' => $program->trainer->id,
                    'name' => $program->trainer->name,
                    'specialization' => $program->trainer->specialization,
                ] : null,
            ] : null,
        ];
    }
}
