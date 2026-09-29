// Package mailer provides abstractions and concrete implementations for sending transactional emails and support notifications.
package mailer

import (
	"context"
	"fmt"
	"log/slog"
	"net/smtp"

	"github.com/pulseforge/pulseforge/internal/platform/config"
)

// EmailMessage contains the recipient, subject, and body for an email dispatch.
type EmailMessage struct {
	To      string
	Subject string
	Body    string
	IsHTML  bool
}

// Mailer defines the contract for email delivery across PulseForge services.
type Mailer interface {
	// Send delivers an email message asynchronously or synchronously according to implementation.
	Send(ctx context.Context, msg EmailMessage) error
}

// SMTPMailer delivers emails via standard SMTP server.
type SMTPMailer struct {
	cfg    config.MailerConfig
	logger *slog.Logger
}

// NewSMTPMailer creates an instance of SMTPMailer.
func NewSMTPMailer(cfg config.MailerConfig, logger *slog.Logger) *SMTPMailer {
	return &SMTPMailer{
		cfg:    cfg,
		logger: logger,
	}
}

// Send transmits an email using configured SMTP credentials.
func (m *SMTPMailer) Send(ctx context.Context, msg EmailMessage) error {
	addr := fmt.Sprintf("%s:%d", m.cfg.SMTPHost, m.cfg.SMTPPort)
	from := m.cfg.FromEmail
	if from == "" {
		from = "no-reply@pulseforge.local"
	}

	contentType := "text/plain; charset=UTF-8"
	if msg.IsHTML {
		contentType = "text/html; charset=UTF-8"
	}

	raw := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: %s\r\n\r\n%s",
		from, msg.To, msg.Subject, contentType, msg.Body)

	var auth smtp.Auth
	if m.cfg.SMTPUsername != "" && m.cfg.SMTPPassword != "" {
		auth = smtp.PlainAuth("", m.cfg.SMTPUsername, m.cfg.SMTPPassword, m.cfg.SMTPHost)
	}

	// In development/local without an external SMTP, log if failed or send
	if m.cfg.SMTPHost == "localhost" || m.cfg.SMTPHost == "mailhog" || m.cfg.SMTPHost == "mailpit" {
		m.logger.InfoContext(ctx, "dispatching email via local SMTP",
			"to", msg.To,
			"subject", msg.Subject,
			"host", addr,
		)
	}

	err := smtp.SendMail(addr, auth, from, []string{msg.To}, []byte(raw))
	if err != nil {
		return fmt.Errorf("sending email to %s via smtp: %w", msg.To, err)
	}

	return nil
}
