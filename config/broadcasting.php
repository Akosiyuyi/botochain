<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Broadcaster
    |--------------------------------------------------------------------------
    */

    'default' => env('BROADCAST_CONNECTION', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Broadcast Connections
    |--------------------------------------------------------------------------
    */

    'connections' => [

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],

        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_BROADCAST_HOST', env('REVERB_HOST', '127.0.0.1')),
                'port' => env('REVERB_BROADCAST_PORT', env('REVERB_PORT', 6001)),
                'scheme' => env('REVERB_BROADCAST_SCHEME', env('REVERB_SCHEME', 'http')),
                'useTLS' => env('REVERB_BROADCAST_SCHEME', env('REVERB_SCHEME', 'http')) === 'https',
            ],
            'client_options' => [
                // Guzzle options for Reverb
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Broadcast Queue
    |--------------------------------------------------------------------------
    */

    'queue' => env('BROADCAST_QUEUE', 'default'),

];