type RefreshTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

type RefreshTokenDelegate = {
  create(args: {
    data: { userId: string; tokenHash: string; expiresAt: Date };
  }): Promise<RefreshTokenRecord>;
  findUnique(args: {
    where: { tokenHash: string };
  }): Promise<RefreshTokenRecord | null>;
  delete(args: { where: { id: string } }): Promise<RefreshTokenRecord>;
  deleteMany(args: {
    where: { userId?: string; tokenHash?: string };
  }): Promise<{ count: number }>;
};

export function refreshTokens(db: object): RefreshTokenDelegate {
  return (db as { refreshToken: RefreshTokenDelegate }).refreshToken;
}
