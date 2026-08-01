package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"
)

type EventLog struct {
	ID         string                 `json:"id"`
	EntityType string                 `json:"entity_type,omitempty"`
	EntityID   string                 `json:"entity_id,omitempty"`
	UserID     string                 `json:"user_id,omitempty"`
	AmountCents int64                 `json:"amount_cents,omitempty"`
	Status     string                 `json:"status,omitempty"`
	Type       string                 `json:"type"`
	Payload    map[string]interface{} `json:"payload,omitempty"`
	Timestamp  time.Time              `json:"timestamp"`
}

type StreamStats struct {
	mu           sync.Mutex
	TotalEvents  int64     `json:"total_events"`
	LastEventAt  time.Time `json:"last_event_at"`
}

var stats = &StreamStats{}

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		stats.mu.Lock()
		defer stats.mu.Unlock()
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "ok",
			"service":      "VAPOR Real-Time Stream Engine",
			"language":     "Go 1.22",
			"total_events": stats.TotalEvents,
			"last_event":   stats.LastEventAt,
		})
	})

	http.HandleFunc("/stream/audit", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		if r.Method == http.MethodPost {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "INVALID_BODY"})
				return
			}

			var incoming map[string]interface{}
			_ = json.Unmarshal(body, &incoming)

			stats.mu.Lock()
			stats.TotalEvents++
			stats.LastEventAt = time.Now()
			stats.mu.Unlock()

			event := EventLog{
				ID:        fmt.Sprintf("evt_%d", time.Now().UnixNano()),
				Type:      "AUDIT_LEDGER_SYNC",
				Payload:   incoming,
				Timestamp: time.Now(),
			}

			log.Printf("🌊 [GO AUDIT STREAM] Ingested Event %s for User %v (Total: %d)", event.ID, incoming["user_id"], stats.TotalEvents)
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(event)
			return
		}

		// GET fallback
		event := EventLog{
			ID:        fmt.Sprintf("evt_%d", time.Now().UnixNano()),
			Type:      "AUDIT_LEDGER_SYNC",
			Timestamp: time.Now(),
		}
		json.NewEncoder(w).Encode(event)
	})

	port := ":8081"
	log.Printf("🚀 VAPOR Go Streaming Service running on http://localhost%s", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

