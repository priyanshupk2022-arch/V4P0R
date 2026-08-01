mod ledger;
mod security;

use axum::{
    routing::{get, post},
    Json, Router,
};
use ledger::BalanceAccount;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    engine: String,
    language: String,
    version: String,
}

#[derive(Deserialize)]
struct AuthorizeRequest {
    user_id: String,
    amount_cents: i64,
}

#[derive(Serialize)]
struct AuthorizeResponse {
    approved: bool,
    user_id: String,
    remaining_balance_cents: Option<i64>,
    reason: Option<String>,
}

struct AppState {
    account: Mutex<BalanceAccount>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = Arc::new(AppState {
        account: Mutex::new(BalanceAccount::new("usr_vapor_rust_01".to_string(), 10000)), // $100.00 initial
    });

    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/authorize", post(authorize_handler))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    println!("⚡ VAPOR Rust Financial Engine running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_handler() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        engine: "VAPOR Ultra-Low Latency Rust Core".to_string(),
        language: "Rust 2021 Edition".to_string(),
        version: "0.1.0".to_string(),
    })
}

async fn authorize_handler(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Json(payload): Json<AuthorizeRequest>,
) -> Json<AuthorizeResponse> {
    let mut account = state.account.lock().unwrap();

    match account.deduct_atomic(payload.amount_cents) {
        Ok(new_balance) => Json(AuthorizeResponse {
            approved: true,
            user_id: payload.user_id,
            remaining_balance_cents: Some(new_balance),
            reason: None,
        }),
        Err(err) => Json(AuthorizeResponse {
            approved: false,
            user_id: payload.user_id,
            remaining_balance_cents: Some(account.balance_cents),
            reason: Some(err),
        }),
    }
}
