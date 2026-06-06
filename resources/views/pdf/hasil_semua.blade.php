<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Hasil Sesi Latihan - {{ $paket->nama_paket }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.6;
            color: #2d3748;
            background: #ffffff;
        }

        /* =========================================
           HEADER
        ========================================= */
        .page-header {
            background-color: #1b5e20;
        }
        .header-top {
            padding: 18px 36px 14px;
            border-bottom: 1px solid rgba(255,255,255,0.15);
        }
        .header-org-name {
            font-size: 18pt;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }
        .header-tagline {
            font-size: 8pt;
            color: rgba(255,255,255,0.75);
            margin-top: 2px;
            letter-spacing: 0.5px;
        }
        .header-bottom {
            padding: 10px 36px 14px;
        }
        .header-doc-type {
            font-size: 8pt;
            color: rgba(255,255,255,0.6);
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .header-doc-title {
            font-size: 13pt;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }

        .stripe {
            height: 4px;
            background-color: #81c784;
        }

        /* =========================================
           CONTENT
        ========================================= */
        .content {
            padding: 24px 36px 30px;
        }

        /* =========================================
           SECTION TITLE
        ========================================= */
        .section-title {
            font-size: 8.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #1b5e20;
            border-bottom: 2px solid #1b5e20;
            padding-bottom: 4px;
            margin-bottom: 10px;
            margin-top: 22px;
        }
        .section-title:first-child {
            margin-top: 0;
        }

        /* =========================================
           INFO TABLE
        ========================================= */
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 4px 0;
            vertical-align: top;
        }
        .info-label {
            width: 140px;
            font-size: 9pt;
            color: #718096;
        }
        .info-colon {
            width: 12px;
            font-size: 9pt;
            color: #a0aec0;
        }
        .info-value {
            font-size: 9.5pt;
            font-weight: bold;
            color: #1a202c;
        }

        /* =========================================
           STAT CARDS (Statistics Summary)
        ========================================= */
        .stats-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 10px;
        }
        .stat-card {
            text-align: center;
            padding: 14px 10px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        .stat-num {
            font-size: 20pt;
            font-weight: bold;
            line-height: 1;
        }
        .stat-label {
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
            color: #718096;
        }
        .card-green { background-color: #e8f5e9; }
        .card-green .stat-num { color: #1b5e20; }
        .card-red { background-color: #ffebee; }
        .card-red .stat-num { color: #c62828; }
        .card-blue { background-color: #e3f2fd; }
        .card-blue .stat-num { color: #1565c0; }
        .card-amber { background-color: #fff8e1; }
        .card-amber .stat-num { color: #f57f17; }
        .card-teal { background-color: #e0f2f1; }
        .card-teal .stat-num { color: #00695c; }

        /* =========================================
           RANK BADGES
        ========================================= */
        .rank-badge {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            font-size: 8pt;
            font-weight: bold;
            color: white;
        }
        .rank-1 { background-color: #f59e0b; }
        .rank-2 { background-color: #94a3b8; }
        .rank-3 { background-color: #cd7f32; }
        .rank-other { background-color: #cbd5e0; color: #4a5568; }

        /* =========================================
           PARTICIPANTS TABLE
        ========================================= */
        .participants-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 9pt;
        }
        .participants-table thead tr {
            background-color: #1b5e20;
        }
        .participants-table th {
            color: #ffffff;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
        }
        .participants-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .participants-table tr:nth-child(even) td {
            background-color: #f7fafc;
        }

        /* Score bar in table */
        .score-bar-bg {
            height: 5px;
            border-radius: 3px;
            margin-top: 4px;
        }

        .badge {
            padding: 2px 8px;
            border-radius: 20px;
            font-size: 7.5pt;
            font-weight: bold;
        }
        .badge-tinggi { background-color: #c6f6d5; color: #276749; }
        .badge-sedang { background-color: #fefcbf; color: #975a16; }
        .badge-rendah { background-color: #fed7d7; color: #9b2c2c; }

        /* =========================================
           QUESTION ANALYSIS TABLE
        ========================================= */
        .analysis-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 9pt;
        }
        .analysis-table thead tr {
            background-color: #2e7d32;
        }
        .analysis-table th {
            color: #ffffff;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
        }
        .analysis-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .analysis-table tr:nth-child(even) td {
            background-color: #f7fafc;
        }
        .accuracy-high { color: #276749; font-weight: bold; }
        .accuracy-mid { color: #975a16; font-weight: bold; }
        .accuracy-low { color: #9b2c2c; font-weight: bold; }

        /* =========================================
           CONCLUSION
        ========================================= */
        .conclusion-box {
            background-color: #f7fafc;
            border-left: 4px solid #1b5e20;
            padding: 14px 18px;
            border-radius: 0 6px 6px 0;
            font-size: 9.5pt;
            color: #2d3748;
            line-height: 1.8;
            margin-top: 8px;
        }

        /* =========================================
           SIGNATURE AREA
        ========================================= */
        .sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 28px;
        }
        .sig-cell {
            width: 33.3%;
            text-align: center;
            padding: 8px 16px;
            vertical-align: top;
        }
        .sig-role {
            font-size: 8pt;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .sig-space {
            height: 56px;
            border-bottom: 1px solid #a0aec0;
            margin: 10px 10px 6px;
        }
        .sig-name {
            font-size: 9pt;
            font-weight: bold;
            color: #2d3748;
        }
        .sig-desc {
            font-size: 7.5pt;
            color: #a0aec0;
            margin-top: 2px;
        }

        /* =========================================
           EXPORT INFO BAR
        ========================================= */
        .export-bar {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 14px;
            margin-top: 20px;
            font-size: 8pt;
            color: #718096;
        }
        .export-bar table {
            width: 100%;
            border-collapse: collapse;
        }
        .export-bar td {
            padding: 0;
        }

        /* =========================================
           FOOTER
        ========================================= */
        .page-footer {
            margin-top: 18px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #a0aec0;
            font-size: 7.5pt;
            line-height: 1.6;
        }
        .footer-brand {
            font-weight: bold;
            color: #1b5e20;
        }
    </style>
</head>
<body>

    <!-- ===== PAGE HEADER ===== -->
    <div class="page-header">
        <div class="header-top">
            <table style="width:100%; border-collapse:collapse;">
                <tr>
                    <td style="vertical-align:middle;">
                        <div class="header-org-name">Tumbuh Berbagi</div>
                        <div class="header-tagline">Platform Belajar Bersama &bull; Diterbitkan: {{ $tanggal }}</div>
                    </td>
                    <td style="text-align:right; vertical-align:middle; width:80px;">
                        <div style="width:60px; height:60px; background-color:rgba(255,255,255,0.15); border-radius:50%; text-align:center; display:inline-block; overflow:hidden;">
                            <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo2.png'))) }}" style="width:48px; height:48px; margin: 6px auto; display: block;" alt="Logo">
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="header-bottom">
            <div class="header-doc-type">Dokumen Resmi &bull; Laporan Sesi Latihan</div>
            <div class="header-doc-title">Laporan Hasil Sesi Latihan &mdash; {{ $paket->nama_paket }}</div>
        </div>
    </div>
    <div class="stripe"></div>

    <!-- ===== CONTENT ===== -->
    <div class="content">

        <!-- INFORMASI SESI -->
        <div class="section-title">Informasi Sesi Latihan</div>
        <table class="info-table">
            <tr>
                <td class="info-label">Nama Paket</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $paket->nama_paket }}</td>
            </tr>
            <tr>
                <td class="info-label">Tanggal Laporan</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $tanggal }}</td>
            </tr>
            <tr>
                <td class="info-label">Total Soal</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $totalSoal }} Soal</td>
            </tr>
            <tr>
                <td class="info-label">Total Terdaftar</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $totalPeserta }} Siswa</td>
            </tr>
        </table>

        <!-- RINGKASAN STATISTIK -->
        <div class="section-title">Ringkasan Statistik</div>
        <table class="stats-grid">
            <tr>
                <td style="padding-right:6px;">
                    <div class="stat-card card-green">
                        <div class="stat-num">{{ $pesertaMengerjakan }}</div>
                        <div class="stat-label">Sudah Mengerjakan</div>
                    </div>
                </td>
                <td style="padding-right:6px;">
                    <div class="stat-card card-red">
                        <div class="stat-num">{{ $belumMengerjakan }}</div>
                        <div class="stat-label">Belum Mengerjakan</div>
                    </div>
                </td>
                <td style="padding-right:6px;">
                    <div class="stat-card card-blue">
                        <div class="stat-num">{{ $rataNilai }}%</div>
                        <div class="stat-label">Rata-rata Nilai</div>
                    </div>
                </td>
                <td style="padding-right:6px;">
                    <div class="stat-card card-teal">
                        <div class="stat-num">{{ $nilaiTertinggi }}%</div>
                        <div class="stat-label">Nilai Tertinggi</div>
                    </div>
                </td>
                <td>
                    <div class="stat-card card-amber">
                        <div class="stat-num">{{ $nilaiTerendah }}%</div>
                        <div class="stat-label">Nilai Terendah</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- DATA PESERTA -->
        <div class="section-title">Peringkat &amp; Data Peserta</div>
        <table class="participants-table">
            <thead>
                <tr>
                    <th style="width:5%; text-align:center;">No</th>
                    <th style="width:30%;">Nama Peserta</th>
                    <th style="width:20%;">Nilai</th>
                    <th style="width:10%; text-align:center;">Benar</th>
                    <th style="width:10%; text-align:center;">Salah</th>
                    <th style="width:15%;">Durasi</th>
                    <th style="width:10%; text-align:center;">Kategori</th>
                </tr>
            </thead>
            <tbody>
                @forelse($peserta as $index => $p)
                <tr>
                    <td style="text-align:center;">
                        @if($index === 0)
                            <span class="rank-badge rank-1">{{ $index + 1 }}</span>
                        @elseif($index === 1)
                            <span class="rank-badge rank-2">{{ $index + 1 }}</span>
                        @elseif($index === 2)
                            <span class="rank-badge rank-3">{{ $index + 1 }}</span>
                        @else
                            <span style="color:#718096; font-size:9pt;">{{ $index + 1 }}</span>
                        @endif
                    </td>
                    <td style="font-weight:bold; color:#1a202c;">{{ $p['nama'] }}</td>
                    <td>
                        <span style="font-size:11pt; font-weight:bold; color:#1b5e20;">{{ $p['nilai'] }}%</span>
                        <table style="width:100%; border-collapse:collapse; margin-top:3px; height:5px;">
                            <tr>
                                <td style="width:{{ $p['nilai'] }}%; background-color:#1b5e20; height:5px; border-radius:3px 0 0 3px;"></td>
                                <td style="width:{{ 100 - $p['nilai'] }}%; background-color:#e2e8f0; height:5px; border-radius:0 3px 3px 0;"></td>
                            </tr>
                        </table>
                    </td>
                    <td style="text-align:center; color:#276749; font-weight:bold;">{{ $p['benar'] }}</td>
                    <td style="text-align:center; color:#9b2c2c; font-weight:bold;">{{ $p['salah'] }}</td>
                    <td style="color:#4a5568;">{{ $p['durasi'] }} Menit</td>
                    <td style="text-align:center;">
                        @if($p['nilai'] >= 80)
                            <span class="badge badge-tinggi">Tinggi</span>
                        @elseif($p['nilai'] >= 60)
                            <span class="badge badge-sedang">Sedang</span>
                        @else
                            <span class="badge badge-rendah">Rendah</span>
                        @endif
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" style="text-align:center; color:#a0aec0; padding:20px; font-style:italic;">
                        Belum ada peserta yang menyelesaikan latihan ini.
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <!-- ANALISIS SOAL -->
        <div class="section-title">Analisis Per Soal</div>
        <table class="analysis-table">
            <thead>
                <tr>
                    <th style="width:5%; text-align:center;">No</th>
                    <th style="width:55%;">Konten Soal</th>
                    <th style="width:10%; text-align:center;">Benar</th>
                    <th style="width:10%; text-align:center;">Salah</th>
                    <th style="width:20%;">Tingkat Akurasi</th>
                </tr>
            </thead>
            <tbody>
                @foreach($analisisSoal as $index => $soal)
                <tr>
                    <td style="text-align:center; font-weight:bold; color:#4a5568;">{{ $index + 1 }}</td>
                    <td>{!! strip_tags($soal['konten']) !!}</td>
                    <td style="text-align:center; color:#276749; font-weight:bold;">{{ $soal['benar'] }}</td>
                    <td style="text-align:center; color:#9b2c2c; font-weight:bold;">{{ $soal['salah'] }}</td>
                    <td>
                        <span class="{{ $soal['akurasi'] >= 70 ? 'accuracy-high' : ($soal['akurasi'] >= 40 ? 'accuracy-mid' : 'accuracy-low') }}">{{ $soal['akurasi'] }}%</span>
                        <table style="width:100%; border-collapse:collapse; margin-top:3px; height:5px;">
                            <tr>
                                <td style="width:{{ $soal['akurasi'] }}%; background-color:{{ $soal['akurasi'] >= 70 ? '#1b5e20' : ($soal['akurasi'] >= 40 ? '#f59e0b' : '#c62828') }}; height:5px; border-radius:3px 0 0 3px;"></td>
                                @if($soal['akurasi'] < 100)
                                <td style="width:{{ 100 - $soal['akurasi'] }}%; background-color:#e2e8f0; height:5px; border-radius:0 3px 3px 0;"></td>
                                @endif
                            </tr>
                        </table>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- KESIMPULAN -->
        <div class="section-title">Kesimpulan &amp; Rekomendasi</div>
        <div class="conclusion-box">
            {!! nl2br(e($kesimpulan)) !!}
        </div>

        <!-- INFO EXPORT -->
        <div class="export-bar">
            <table>
                <tr>
                    <td><strong>Diekspor oleh:</strong> {{ $adminNama }}</td>
                    <td style="text-align:right;"><strong>Waktu Ekspor:</strong> {{ $waktuExport }}</td>
                </tr>
            </table>
        </div>

        <!-- TANDA TANGAN -->
        <table class="sig-table">
            <tr>
                <td class="sig-cell">
                    <div class="sig-role">Diterbitkan Oleh</div>
                    <div class="sig-space"></div>
                    <div class="sig-name">Sistem Tumbuh Berbagi</div>
                    <div class="sig-desc">Platform Belajar Bersama</div>
                </td>
                <td class="sig-cell">
                </td>
                <td class="sig-cell">
                    <div class="sig-role">Disetujui Oleh</div>
                    <div class="sig-space"></div>
                    <div class="sig-name">{{ $adminNama }}</div>
                    <div class="sig-desc">Admin / Pengajar</div>
                </td>
            </tr>
        </table>

        <!-- FOOTER -->
        <div class="page-footer">
            <span class="footer-brand">Tumbuh Berbagi</span> &bull; Platform Belajar Bersama<br>
            Dokumen ini diterbitkan secara otomatis oleh sistem pada {{ $waktuExport }}.<br>
            Dokumen sah tanpa tanda tangan basah apabila dicetak dari sistem resmi Tumbuh Berbagi.
        </div>

    </div>

</body>
</html>
