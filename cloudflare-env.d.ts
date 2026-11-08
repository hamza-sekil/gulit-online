declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    CHAPA_SECRET_KEY?: string;
  }
}
