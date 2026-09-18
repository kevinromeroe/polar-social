export type SocialNetwork = "instagram" | "facebook" | "tiktok" | "linkedin" | "x" | "reddit";
export type AccountType = "own" | "competitor";

export interface Client {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  auth_email: string;
  created_at: string;
}

export interface Account {
  id: string;
  client_id: string | null;
  brand_name: string;
  network: SocialNetwork;
  account_type: AccountType;
  product_line: string | null;
  username: string;
  profile_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountSnapshot {
  id: string;
  account_id: string;
  followers: number | null;
  following: number | null;
  total_posts: number | null;
  snapshot_date: string;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface Post {
  id: string;
  account_id: string;
  network: SocialNetwork;
  post_id_native: string;
  post_url: string | null;
  post_type: string | null;
  caption: string | null;
  mentions: string[] | null;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  saves: number;
  engagement_total: number;
  published_at: string | null;
  scraped_at: string;
  raw_data: Record<string, unknown> | null;
}

export interface ScrapeRun {
  id: string;
  run_type: string;
  network: SocialNetwork | null;
  status: string;
  accounts_processed: number;
  posts_scraped: number;
  apify_run_id: string | null;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
}

export interface Comment {
  id: string;
  post_id: string | null;
  account_id: string | null;
  network: string;
  comment_id_native: string | null;
  author_username: string | null;
  author_name: string | null;
  text: string | null;
  likes: number;
  replies_count: number;
  published_at: string | null;
  scraped_at: string;
  raw_data: Record<string, unknown> | null;
}

export interface Database {
  public: {
    Tables: {
      clients: { Row: Client; Insert: Omit<Client, "id" | "created_at">; Update: Partial<Client> };
      accounts: { Row: Account; Insert: Omit<Account, "id" | "created_at" | "updated_at">; Update: Partial<Account> };
      account_snapshots: { Row: AccountSnapshot; Insert: Omit<AccountSnapshot, "id" | "created_at">; Update: Partial<AccountSnapshot> };
      posts: { Row: Post; Insert: Omit<Post, "id" | "scraped_at" | "engagement_total">; Update: Partial<Post> };
      scrape_runs: { Row: ScrapeRun; Insert: Omit<ScrapeRun, "id" | "started_at">; Update: Partial<ScrapeRun> };
      comments: { Row: Comment; Insert: Omit<Comment, "id" | "scraped_at">; Update: Partial<Comment> };
    };
  };
}
