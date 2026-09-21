-- Player wallet/RBAC feature compatibility migration.
--
-- Production already contains the hardened implementations for:
--   - RBAC authorization
--   - player wager placement
--   - wager settlement
--   - wallet operations
--   - profile balance protection
--   - wager financial constraints
--
-- This migration intentionally makes no schema or function changes.
--
-- Do NOT recreate or replace:
--   public.authorize()
--   public.place_bet()
--   public.settle_wager()
--   public.deposit_funds()
--   public.withdraw_funds()
--   public.prevent_unauthorized_role_change()
--
-- The player application consumes the existing production APIs.
--
-- Future wallet/database changes must use additive migrations that
-- preserve the existing financial security model.

DO $$
BEGIN
  RAISE NOTICE
    '0003_player_wallet_features: production wallet/RBAC implementation already exists; no changes applied.';
END
$$;
