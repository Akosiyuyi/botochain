<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Election;
use App\Models\ElectionSetup;
use Carbon\Carbon;

class ElectionSetupController extends Controller
{

    /**
     * Update the specified resource in storage.
     */
    public function update(
        Request $request,
        Election $election,
        ElectionSetup $setup
    ) {
        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
        ]);

        $startDateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            "{$validated['start_date']} {$validated['start_time']}",
            config('app.timezone')
        );

        $endDateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            "{$validated['start_date']} {$validated['end_time']}",
            config('app.timezone')
        );

        /** Rule 1: Start date must not be behind today */
        if ($startDateTime->lt(now(config('app.timezone'))->startOfDay())) {
            return back()->withErrors([
                'start_date' => 'Start date cannot be earlier than today.',
            ]);
        }

        /** Rule 2: Start must not be in the past */
        $now = now(config('app.timezone'));
        if ($startDateTime->lt($now)) {
            return back()->withErrors([
                'start_time' => 'Start time cannot be earlier than the current time.',
            ]);
        }

        /** Rule 3: End must be after start */
        if ($endDateTime->lessThanOrEqualTo($startDateTime)) {
            return back()->withErrors([
                'end_time' => 'End time must be after start time.',
            ]);
        }

        $setup->update([
            'start_time' => $startDateTime,
            'end_time' => $endDateTime,
        ]);

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', 'Election schedule updated.');
    }


}
