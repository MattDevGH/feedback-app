// Domain types for review tokens.

export type ReviewToken = {
  id: string;
  token: string;
  name: string;
  createdAt: Date;
  expiresAt: Date | null;
  submissionId: string | null;
};

export type CreateTokenData = {
  name: string;
  expiresAt?: Date;
};

export interface TokenRepository {
  create(data: CreateTokenData): Promise<ReviewToken>;
  findByToken(token: string): Promise<ReviewToken | null>;
  markSubmitted(token: string, submissionId: string): Promise<ReviewToken>;
  findAll(): Promise<ReviewToken[]>;
}
