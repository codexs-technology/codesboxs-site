export type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
  PUBLIC_SITE_URL: string;
  LOCAL_TEST_MODE?: string;
  ADMIN_BOOTSTRAP_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  NOTIFICATION_EMAIL?: string;
  SEND_CONFIRMATIONS?: string;
  PAYMENT_PROVIDER?: string;
};
export type Session = {
  admin_id: string;
  email: string;
  csrf_token: string;
  token_hash: string;
};
export type AppEnv = {
  Bindings: Env;
  Variables: { session: Session; requestId: string };
};
