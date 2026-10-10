<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminEmailChangeVerification extends Notification
{
    use Queueable;

    public function __construct(public readonly string $verificationUrl)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verifikasi perubahan email Admin TumbuhBerbagi')
            ->greeting('Halo Admin,')
            ->line('Kami menerima permintaan untuk mengganti email akun Admin TumbuhBerbagi.')
            ->action('Verifikasi email baru', $this->verificationUrl)
            ->line('Email aktif tidak berubah sebelum alamat baru diverifikasi. Tautan ini berlaku selama 60 menit.');
    }
}
