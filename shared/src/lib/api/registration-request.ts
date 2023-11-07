import {LoginRequest} from '@kb-rest/shared';

export interface RegistrationRequest extends LoginRequest{
  email: string;
}
