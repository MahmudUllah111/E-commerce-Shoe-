<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public \App\Models\Order $order,
        public string $status = 'pending',
        public ?string $customSubject = null,
        public ?string $note = null,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->customSubject ?? match($this->status) {
            'pending' => "Order #{$this->order->order_number} Confirmed — TrustedMart",
            'shipped' => "Order #{$this->order->order_number} Shipped — TrustedMart",
            'delivered' => "Order #{$this->order->order_number} Delivered — TrustedMart",
            default => "Order #{$this->order->order_number} Update: " . ucfirst($this->status) . " — TrustedMart",
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        $order = $this->order;
        $status = $this->status;
        $note = $this->note;

        return new Content(
            view: 'emails.order_status',
            with: compact('order', 'status', 'note'),
        );
    }
}
