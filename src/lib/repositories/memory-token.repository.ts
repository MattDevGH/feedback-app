import crypto from "crypto";
import type { CreateTokenData, ReviewToken, TokenRepository } from "./token.repository";

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
      createdAt: new Date(),
      expiresAt: data.expiresAt ?? null,
      submissionId: null,
    };
    this.store.push(token);
    return token;
  }

  async findByToken(token: string): Promise<ReviewToken | null> {
    return this.store.find((t) => t.token === token) ?? null;
  }

  async markSubmitted(token: string, submissionId: string): Promise<ReviewToken> {
    const found = this.store.find((t) => t.token === token);
    if (!found) throw new Error(`Token not found: ${token}`);
    found.submissionId = submissionId;
    return found;
  }

  async findAll(): Promise<ReviewToken[]> {
    return [...this.store];
  }
}
