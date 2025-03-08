export interface Document {
  id: string;
  metadata: {
    title: string;
    email: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt?: string;
  collaborators?: {
    id: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
  }[];
}