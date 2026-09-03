<?php

namespace App\Mail;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $customSubject = '',
        public string $statusNote = ''
    ) {}

    public function envelope(): Envelope
    {
        $subject = !empty($this->customSubject) 
            ? $this->customSubject 
            : "Order Confirmation #{$this->order->order_number} — TrustedMart";

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_confirmation',
            with: [
                'order' => $this->order,
                'statusNote' => $this->statusNote,
            ]
        );
    }

    public function attachments(): array
    {
        $this->order->loadMissing(['items.product', 'items.productVariant', 'user']);

        $invoicePdf = Pdf::loadView('pdfs.invoice', ['order' => $this->order])->setPaper('a4');
        $packingSlipPdf = Pdf::loadView('pdfs.packing-slip', ['order' => $this->order])->setPaper('a4');

        return [
            Attachment::fromData(fn () => $invoicePdf->output(), "invoice-{$this->order->order_number}.pdf")
                ->withMime('application/pdf'),
            Attachment::fromData(fn () => $packingSlipPdf->output(), "packing-slip-{$this->order->order_number}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}

