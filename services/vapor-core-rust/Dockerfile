FROM rust:1.78-slim AS builder
WORKDIR /usr/src/vapor-core-rust
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/vapor-core-rust/target/release/vapor-core-rust /usr/local/bin/
EXPOSE 8080
CMD ["vapor-core-rust"]
