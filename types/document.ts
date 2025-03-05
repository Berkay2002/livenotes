export interface DocumentData {
    id: string;
    metadata: {
      creatorId: string;
      email: string;
      title: string;
    };
    usersAccesses: Record<string, string[]>;
    createdAt: string;
  }