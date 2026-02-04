<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ElectionResultsUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $electionId,
        public array $updates,
        public array $metrics
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel("election.{$this->electionId}");
    }

    public function broadcastAs(): string
    {
        return 'election.results.updated';
    }
}