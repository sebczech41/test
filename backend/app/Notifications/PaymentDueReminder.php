<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentDueReminder extends Notification
{
    use Queueable;

    public function __construct(public Payment $payment)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $reservation = $this->payment->reservation;
        $plotCode = $reservation?->plot?->code ?? 'your plot';
        $overdue = $this->payment->status === 'overdue';

        return (new MailMessage)
            ->subject($overdue ? 'Overdue fee reminder' : 'Upcoming fee reminder')
            ->greeting('Dear '.($notifiable->name ?? 'family').',')
            ->line(sprintf(
                'A %s fee of $%s for plot %s is %s on %s.',
                $reservation?->billing_cycle ?? 'recurring',
                number_format((float) $this->payment->amount, 2),
                $plotCode,
                $overdue ? 'overdue since' : 'due',
                $this->payment->due_date->toFormattedDateString(),
            ))
            ->line('Please contact our office or use your usual payment method to settle this fee.')
            ->line('Thank you.');
    }
}
