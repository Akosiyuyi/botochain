<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Election Results - {{ $election->title }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #16A34A;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #16A34A;
            margin: 0;
            font-size: 24px;
        }

        .header p {
            margin: 5px 0;
            color: #666;
        }

        .summary {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
        }

        .summary-item strong {
            color: #374151;
        }

        .position {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }

        .position-header {
            background: #16A34A;
            color: white;
            padding: 10px 15px;
            border-radius: 6px 6px 0 0;
            font-size: 16px;
            font-weight: bold;
        }

        .position-body {
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 6px 6px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }

        tr:last-child td {
            border-bottom: none;
        }

        .rank {
            width: 50px;
            text-align: center;
            font-weight: bold;
            color: #16A34A;
        }

        .votes {
            text-align: right;
            font-weight: bold;
        }

        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 10px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $election->title }}</h1>
        <p>Election Results Report</p>
        <p>Generated: {{ now()->format('F d, Y h:i A') }}</p>
    </div>

    <div class="summary">
        <h3 style="margin-top: 0;">Election Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <span>Eligible Voters:</span>
                <strong>{{ number_format($eligibleVoters) }}</strong>
            </div>
            <div class="summary-item">
                <span>Votes Cast:</span>
                <strong>{{ number_format($votesCast) }}</strong>
            </div>
            <div class="summary-item">
                <span>Turnout Rate:</span>
                <strong>{{ $turnout }}%</strong>
            </div>
            <div class="summary-item">
                <span>Total Positions:</span>
                <strong>{{ $positions->count() }}</strong>
            </div>
        </div>
    </div>

    @foreach($positions as $position)
        <div class="position">
            <div class="position-header">
                {{ $position['name'] }}
            </div>
            <div class="position-body">
                <table>
                    <thead>
                        <tr>
                            <th class="rank">#</th>
                            <th>Candidate Name</th>
                            <th>Party List</th>
                            <th class="votes">Votes</th>
                            <th style="text-align: right;">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($position['candidates'] as $index => $candidate)
                            <tr>
                                <td class="rank">{{ $index + 1 }}</td>
                                <td>{{ $candidate['name'] }}</td>
                                <td>{{ $candidate['partylist'] }}</td>
                                <td class="votes">{{ number_format($candidate['votes']) }}</td>
                                <td style="text-align: right;">
                                    {{ $position['total_votes'] > 0 ? number_format(($candidate['votes'] / $position['total_votes']) * 100, 2) : 0 }}%
                                </td>
                            </tr>
                        @endforeach
                        @if($position['candidates']->isEmpty())
                            <tr>
                                <td colspan="5" style="text-align: center; color: #999;">No votes cast for this position</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>
        </div>
    @endforeach

    <div class="footer">
        <p>This is an official election results report generated by the system.</p>
        <p>Report ID: {{ $election->id }} | Generated at {{ now()->toDateTimeString() }}</p>
    </div>
</body>

</html>