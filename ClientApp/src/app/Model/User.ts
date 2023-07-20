export interface User {
  id?: number;
  createdDate?: Date;
  modifiedDate?: Date;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  cloudId?: number;
}
