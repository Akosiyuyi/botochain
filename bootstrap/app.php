<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        channels: __DIR__ . '/../routes/channels.php',
        attributes: ['middleware' => ['web', 'auth']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);

        // to redirect to designated dashboard when accessing guest only urls
        $middleware->redirectUsersTo(function (Request $request): string {
            if (Auth::check()) {
                /** @var \App\Models\User $user */
                $user = Auth::user();

                
                if ($user->hasRole('super-admin')) {
                    return route('admin.dashboard');
                }
                if ($user->hasRole('admin')) {
                    return route('admin.dashboard');
                }
                if ($user->hasRole('voter')) {
                    return route('voter.dashboard');
                }
                return '/';
            }
            // if guest, keep them on intended URL (usually /login)
            return $request->fullUrl();
        });


        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
