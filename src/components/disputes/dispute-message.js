"use client";

import { useState } from "react";
import { addDisputeMessage } from "@/lib/disputeStorage";

import "./dispute-details.css"

export default function DisputeMessages({
  dispute,
  currentUser,
  onUpdate,
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const messages = dispute?.messages || [];
  const isClosed = ["Resolved", "Closed"].includes(dispute?.status);

  function handleSubmit(event) {
    event.preventDefault();

    if (!message.trim()) {
      setError("Please enter a reply.");
      return;
    }

    setSending(true);
    setError("");

    try {
      addDisputeMessage(dispute.id, message, currentUser);
      setMessage("");
      onUpdate?.();
    } catch (err) {
      setError(err.message || "Could not send your reply.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="dispute-conversation">
      <header className="dispute-conversation-header">
        <div className="dispute-conversation-heading">
          <span className="dispute-conversation-icon" aria-hidden="true">
            &#9993;
          </span>

          <div>
            <h2 className="dispute-conversation-title">
              Conversation
            </h2>

            <p className="dispute-conversation-description">
              Replies are visible to the renter, owner, and admin.
            </p>
          </div>
        </div>

        <span className="dispute-message-count">
          {messages.length} {messages.length === 1 ? "reply" : "replies"}
        </span>
      </header>

      <div className="dispute-conversation-list" aria-live="polite">
        {messages.length === 0 ? (
          <div className="dispute-conversation-empty">
            <span
              className="dispute-conversation-empty-icon"
              aria-hidden="true"
            >
              &#9993;
            </span>

            <h3>No replies yet</h3>

            <p>Start the conversation by writing a message below.</p>
          </div>
        ) : (
          messages.map((item) => {
            const isOwnMessage =
              String(item.senderId) === String(currentUser?.id);

            return (
              <article
                key={item.id}
                className={`dispute-message-card ${
                  isOwnMessage
                    ? "dispute-message-own"
                    : "dispute-message-other"
                }`}
              >
                <div className="dispute-message-header">
                  <div className="dispute-message-sender">
                    <span className="dispute-message-avatar" aria-hidden="true">
                      {(item.senderRole === "admin"
                        ? "A"
                        : item.senderRole || "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <p className="dispute-message-sender-name">
                      {item.senderRole === "admin"
                        ? "Admin"
                        : item.senderRole || "User"}

                      {isOwnMessage && (
                        <span className="dispute-message-you">
                          You
                        </span>
                      )}
                    </p>
                  </div>

                  <time className="dispute-message-time">
                    {item.createdAt &&
                    !Number.isNaN(new Date(item.createdAt).getTime())
                      ? new Date(item.createdAt).toLocaleString()
                      : "Time unavailable"}
                  </time>
                </div>

                <p className="dispute-message-text">
                  {item.message}
                </p>
              </article>
            );
          })
        )}
      </div>

      {error && (
        <p
          className="dispute-conversation-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {isClosed ? (
        <div className="dispute-conversation-closed">
          <span
            className="dispute-closed-indicator"
            aria-hidden="true"
          />

          <p>
            This dispute is {dispute.status.toLowerCase()}. New replies
            are disabled.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="dispute-reply-form"
        >
          <label
            htmlFor="dispute-reply"
            className="dispute-reply-label"
          >
            Write a reply
          </label>

          <textarea
            id="dispute-reply"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);

              if (error) {
                setError("");
              }
            }}
            rows={4}
            maxLength={3000}
            placeholder="Write your message here..."
            className="dispute-reply-textarea"
            aria-invalid={Boolean(error)}
            aria-describedby="dispute-reply-counter"
            disabled={sending}
          />

          <div className="dispute-reply-footer">
            <p
              id="dispute-reply-counter"
              className="dispute-reply-counter"
            >
              {message.length}/3000 characters
            </p>

            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="dispute-reply-button"
            >
              {sending ? "Sending..." : "Send reply"}
              {!sending && (
                <span aria-hidden="true">&nbsp;→</span>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}