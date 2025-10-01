export interface IUserEmail {
  email: string;
}

export interface IUserData extends IUserEmail {
  firstName: string;
  lastName: string;
  address: string;
  verificationCode: string;
  consent: boolean;
  nonUsPerson: boolean;
  package: number;
}
