export interface Creative {
  id: string;
  title: string;
  fileUrl: string;
  type: 'image' | 'video';
  category: 'official' | 'mine';
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedBy: {
    userId: string;
    userName: string;
  };
  createdAt: number;
}
