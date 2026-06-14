<?php

namespace App\Console\Commands;

use App\Models\Program;
use App\Services\ProgramPlanGenerator;
use Illuminate\Console\Command;

class SyncProgramPlans extends Command
{
    protected $signature = 'programs:sync-plans';

    protected $description = 'Make every training program free and create any missing weekly workout plans';

    public function handle(ProgramPlanGenerator $generator): int
    {
        Program::query()->update(['price' => 0]);

        $programs = 0;
        $workouts = 0;

        Program::query()->orderBy('id')->chunkById(50, function ($items) use ($generator, &$programs, &$workouts): void {
            foreach ($items as $program) {
                $generator->ensure($program);
                $programs++;
                $workouts += $program->workouts()->count();
            }
        });

        $this->info("Готово: программ — {$programs}, тренировок в планах — {$workouts}.");

        return self::SUCCESS;
    }
}
