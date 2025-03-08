export interface Document {
  id: string;
  metadata: {
    title: string;
    email: string;
    creatorId?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt?: string;
  collaborators?: {
    id: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
  }[];
  usersAccesses?: Record<string, string[]>; // User access rights
}