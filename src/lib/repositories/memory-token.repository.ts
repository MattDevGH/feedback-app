import crypto from "crypto";
import type {
  CreateTokenData,
  RequestTokenData,
  ReviewToken,
  TokenRepository,
  TokenStatus,
} from "./token.repository";

export class MemoryTokenRepository implements TokenRepository {
  private store: ReviewToken[] = [];

  constructor(initialData: ReviewToken[] = []) {
    this.store = [...initialData];
  }

  async create(data: CreateTokenData): Promise<ReviewToken> {
    const token: ReviewToken = {
      id: `mem-tok-${this.store.length + 1}`,
      token: crypto.randomBytes(32).toString("hex"),
      name: data.name,
      message: null,
      status: "pending",
      createdAt: new Date(),
      usedAt: null,
      expiresAt: data.expiresAt ?? null,
      submissionId: null,
    };
    this.store.push(token);
    return token;
  }

  async createRequest(data: RequestTokenData): Promise<ReviewToken> {
    const token: ReviewToken = {
      id: `mem-tok-${this.store.length + 1}`,
      token: crypto.randomBytes(32).toString("hex"),
      name: data.name,
      message: data.message,
      status: "requested",
      createdAt: new Date(),
      usedAt: null,
      expiresAt: null,
      submissionId: null,
    };
    this.store.push(token);
    return token;
  }

  async findByToken(token: string): Promise<ReviewToken | null> {
    return this.store.find((t) => t.token === token) ?? null;
  }

  async findById(id: string): Promise<ReviewToken | null> {
    return this.store.find((t) => t.id === id) ?? null;
  }

  async approve(id: string): Promise<ReviewToken> {
    const found = this.store.find((t) => t.id === id);
    if (!found) throw new Error(`Token not found: ${id}`);
    found.status = "pending";
    return found;
  }

  async markSubmitted(token: string, submissionId: string): Promise<ReviewToken> {
    const found = this.store.find((t) => t.token === token);
    if (!found) throw new Error(`Token not found: ${token}`);
    found.status = "submitted";
    found.submissionId = submissionId;
    found.usedAt = new Date();
    return found;
  }

  async markAnonymous(token: string): Promise<ReviewToken> {
    const found = this.store.find((t) => t.token === token);
    if (!found) throw new Error(`Token not found: ${token}`);
    found.status = "anonymous";
    found.usedAt = new Date();
    return found;
  }

  async countByStatus(status: TokenStatus): Promise<number> {
    return this.store.filter((t) => t.status === status).length;
  }

  async findAll(): Promise<ReviewToken[]> {
    return [...this.store];
  }
}
