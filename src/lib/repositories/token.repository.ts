// Domain types for review tokens.

export type TokenStatus = "requested" | "pending" | "submitted" | "anonymous";

export type ReviewToken = {
  id: string;
  token: string;
  name: string;
  message: string | null;
  status: TokenStatus;
  createdAt: Date;
  usedAt: Date | null;
  expiresAt: Date | null;
  submissionId: string | null;
};

export type CreateTokenData = {
  name: string;
  expiresAt?: Date;
};

export type RequestTokenData = {
  name: string;
  message: string;
};

export interface TokenRepository {
  create(data: CreateTokenData): Promise<ReviewToken>;
  createRequest(data: RequestTokenData): Promise<ReviewToken>;
  findByToken(token: string): Promise<ReviewToken | null>;
  findById(id: string): Promise<ReviewToken | null>;
  approve(id: string): Promise<ReviewToken>;
  markSubmitted(token: string, submissionId: string): Promise<ReviewToken>;
  markAnonymous(token: string): Promise<ReviewToken>;
  countByStatus(status: TokenStatus): Promise<number>;
  findAll(): Promise<ReviewToken[]>;
}
