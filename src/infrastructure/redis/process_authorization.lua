-- Upstash Redis Hot-Path Atomic Authorization Script
-- KEY[1]: user balance key (e.g. "user:usr_123:balance")
-- KEY[2]: card status key (e.g. "card:card_456:status")
-- ARGV[1]: authorization amount in integer cents (e.g. "1500")

local balance_key = KEYS[1]
local card_status_key = KEYS[2]
local amount_cents = tonumber(ARGV[1])

if not amount_cents or amount_cents <= 0 then
    return {0, "INVALID_AMOUNT"}
end

-- Check card status
local card_status = redis.call("GET", card_status_key)
if card_status and card_status ~= "ACTIVE" then
    return {0, "CARD_LOCKED"}
end

-- Check balance
local current_balance_str = redis.call("GET", balance_key)
local current_balance = tonumber(current_balance_str) or 0

if current_balance < amount_cents then
    return {0, "INSUFFICIENT_FUNDS"}
end

-- Atomic deduction
local new_balance = redis.call("DECRBY", balance_key, amount_cents)
return {1, tostring(new_balance)}
