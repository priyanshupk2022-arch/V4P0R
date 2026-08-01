use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransactionState {
    Initiated,
    Authorized,
    Settled,
    Declined,
    Reversed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BalanceAccount {
    pub user_id: String,
    pub balance_cents: i64, // Strict integer minor units
}

impl BalanceAccount {
    pub fn new(user_id: String, initial_balance_cents: i64) -> Self {
        Self {
            user_id,
            balance_cents: initial_balance_cents,
        }
    }

    pub fn deduct_atomic(&mut self, amount_cents: i64) -> Result<i64, String> {
        if amount_cents <= 0 {
            return Err("Amount must be positive".to_string());
        }
        if self.balance_cents < amount_cents {
            return Err("INSUFFICIENT_FUNDS".to_string());
        }
        self.balance_cents -= amount_cents;
        Ok(self.balance_cents)
    }
}
