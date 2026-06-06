<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Hasil Siswa - {{ $siswa->nama }}</title>
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
            padding: 0;
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

        /* =========================================
           DECORATIVE STRIPE
        ========================================= */
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
            width: 150px;
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
           SCORE SUMMARY CARD
        ========================================= */
        .score-card {
            background-color: #f0faf0;
            border: 1.5px solid #a5d6a7;
            border-radius: 8px;
            padding: 18px 22px;
            margin-top: 10px;
        }
        .score-layout {
            width: 100%;
            border-collapse: collapse;
        }
        .score-big {
            font-size: 38pt;
            font-weight: bold;
            color: #1b5e20;
            line-height: 1;
        }
        .score-pct {
            font-size: 16pt;
            font-weight: bold;
            color: #1b5e20;
        }
        .score-subtitle {
            font-size: 8pt;
            color: #4a5568;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }
        .score-verdict {
            margin-top: 10px;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 8.5pt;
            font-weight: bold;
            display: inline-block;
        }
        .verdict-lulus {
            background-color: #c6f6d5;
            color: #276749;
        }
        .verdict-gagal {
            background-color: #fed7d7;
            color: #9b2c2c;
        }

        /* Progress bar via table */
        .progress-bg {
            width: 100%;
            background-color: #c8e6c9;
            border-radius: 3px;
            height: 7px;
            margin-top: 8px;
            border: 0;
            border-collapse: collapse;
        }

        /* Stats mini cards */
        .mini-stat {
            text-align: center;
            padding: 12px 8px;
            border-radius: 6px;
        }
        .mini-stat-num {
            font-size: 18pt;
            font-weight: bold;
            line-height: 1;
        }
        .mini-stat-label {
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 3px;
        }
        .mini-green {
            background-color: #e8f5e9;
        }
        .mini-green .mini-stat-num { color: #1b5e20; }
        .mini-green .mini-stat-label { color: #4caf50; }
        .mini-red {
            background-color: #ffebee;
        }
        .mini-red .mini-stat-num { color: #c62828; }
        .mini-red .mini-stat-label { color: #ef9a9a; }
        .mini-blue {
            background-color: #e3f2fd;
        }
        .mini-blue .mini-stat-num { color: #1565c0; }
        .mini-blue .mini-stat-label { color: #64b5f6; }

        /* =========================================
           ANSWER TABLE
        ========================================= */
        .answer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 9pt;
        }
        .answer-table thead tr {
            background-color: #1b5e20;
        }
        .answer-table th {
            color: #ffffff;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
        }
        .answer-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .answer-table tr:nth-child(even) td {
            background-color: #f7fafc;
        }
        .num-col {
            text-align: center;
            font-weight: bold;
            color: #4a5568;
            width: 4%;
        }
        .question-col { width: 44%; }
        .answer-col { width: 20%; }
        .correct-col { width: 20%; color: #1b5e20; font-weight: bold; }
        .status-col { width: 12%; text-align: center; }

        .badge {
            padding: 2px 8px;
            border-radius: 20px;
            font-size: 7.5pt;
            font-weight: bold;
        }
        .badge-benar { background-color: #c6f6d5; color: #276749; }
        .badge-salah { background-color: #fed7d7; color: #9b2c2c; }

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
        .signature-section {
            margin-top: 30px;
        }
        .sig-table {
            width: 100%;
            border-collapse: collapse;
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
           FOOTER
        ========================================= */
        .page-footer {
            margin-top: 24px;
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
            <div class="header-doc-type">Dokumen Resmi &bull; Laporan Individual</div>
            <div class="header-doc-title">Laporan Hasil Sesi Latihan Siswa</div>
        </div>
    </div>
    <div class="stripe"></div>

    <!-- ===== CONTENT ===== -->
    <div class="content">

        <!-- INFORMASI SISWA -->
        <div class="section-title">Informasi Siswa</div>
        <table class="info-table">
            <tr>
                <td class="info-label">Nama Siswa</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $siswa->nama }}</td>
            </tr>
            <tr>
                <td class="info-label">Alamat Email</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $siswa->email }}</td>
            </tr>
            <tr>
                <td class="info-label">Paket Latihan</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $paket->nama_paket }}</td>
            </tr>
            <tr>
                <td class="info-label">Tanggal Pengerjaan</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $tanggal }}</td>
            </tr>
            <tr>
                <td class="info-label">Durasi Pengerjaan</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $durasi }} Menit</td>
            </tr>
        </table>

        <!-- HASIL AKHIR -->
        <div class="section-title">Ringkasan Hasil</div>
        <div class="score-card">
            <table class="score-layout">
                <tr>
                    <td style="vertical-align:middle; width:48%; padding-right:20px;">
                        <div class="score-big">{{ $hasil->nilai_akhir }}<span class="score-pct">%</span></div>
                        <div class="score-subtitle">Nilai Akhir</div>
                        <!-- Progress Bar via table trick -->
                        <table style="width:100%; border-collapse:collapse; margin-top:8px; height:7px;">
                            <tr>
                                <td style="width:{{ $hasil->nilai_akhir }}%; background-color:#1b5e20; height:7px; border-radius:3px 0 0 3px;"></td>
                                <td style="width:{{ 100 - $hasil->nilai_akhir }}%; background-color:#c8e6c9; height:7px; border-radius:0 3px 3px 0;"></td>
                            </tr>
                        </table>
                        <div style="margin-top:8px;">
                            @if($hasil->nilai_akhir >= 70)
                                <span class="score-verdict verdict-lulus">&#10003; Lulus &mdash; Pemahaman materi sangat baik</span>
                            @else
                                <span class="score-verdict verdict-gagal">&#10005; Perlu Peningkatan &mdash; Di bawah batas (70%)</span>
                            @endif
                        </div>
                    </td>
                    <td style="vertical-align:middle; width:52%;">
                        <table style="width:100%; border-collapse:collapse;">
                            <tr>
                                <td style="padding-right:6px;">
                                    <div class="mini-stat mini-green">
                                        <div class="mini-stat-num">{{ $hasil->jumlah_benar }}</div>
                                        <div class="mini-stat-label">Jawaban Benar</div>
                                    </div>
                                </td>
                                <td style="padding-right:6px;">
                                    <div class="mini-stat mini-red">
                                        <div class="mini-stat-num">{{ $hasil->jumlah_salah }}</div>
                                        <div class="mini-stat-label">Jawaban Salah</div>
                                    </div>
                                </td>
                                <td>
                                    <div class="mini-stat mini-blue">
                                        <div class="mini-stat-num">{{ $durasi }}</div>
                                        <div class="mini-stat-label">Menit Durasi</div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        <!-- DETAIL JAWABAN -->
        <div class="section-title">Detail Jawaban</div>
        <table class="answer-table">
            <thead>
                <tr>
                    <th class="num-col">No</th>
                    <th class="question-col">Pertanyaan</th>
                    <th class="answer-col">Jawaban Siswa</th>
                    <th class="correct-col">Kunci Jawaban</th>
                    <th class="status-col">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($detailJawaban as $index => $detail)
                <tr>
                    <td class="num-col">{{ $index + 1 }}</td>
                    <td class="question-col">{!! strip_tags($detail['pertanyaan']) !!}</td>
                    <td class="answer-col">{{ $detail['jawaban_siswa'] }}</td>
                    <td class="correct-col">{{ $detail['jawaban_benar'] }}</td>
                    <td class="status-col">
                        @if($detail['status'] === 'BENAR')
                            <span class="badge badge-benar">Benar</span>
                        @else
                            <span class="badge badge-salah">Salah</span>
                        @endif
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

        <!-- TANDA TANGAN -->
        <div class="signature-section">
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
                        <div class="sig-role">Diketahui Oleh</div>
                        <div class="sig-space"></div>
                        <div class="sig-name">&nbsp;</div>
                        <div class="sig-desc">Admin / Pengajar</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- FOOTER -->
        <div class="page-footer">
            <span class="footer-brand">Tumbuh Berbagi</span> &bull; Platform Belajar Bersama<br>
            Dokumen ini diterbitkan secara otomatis oleh sistem pada tanggal {{ $tanggal }}.<br>
            Dokumen sah tanpa tanda tangan basah apabila dicetak dari sistem resmi Tumbuh Berbagi.
        </div>

    </div>

</body>
</html>
