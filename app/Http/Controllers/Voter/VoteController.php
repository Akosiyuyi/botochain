<?php

namespace App\Http\Controllers\Voter;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Services\VoteService;

class VoteController extends Controller
{

    public function __construct(
        protected VoteService $voteService,
    ) {

    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Election $election)
    {
        try {
            $this->voteService->create($election, $request->choices, $request->student);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Grab the first error message
            $message = collect($e->errors())->flatten()->first();

            return back()->with('error', $message);
        }

        return back()->with('success', 'Vote submitted successfully.');
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
