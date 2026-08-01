FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o vapor-stream-go main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/vapor-stream-go .
EXPOSE 8081
CMD ["./vapor-stream-go"]
