export interface RegistrationRequest {
  username: string;
}

export interface RegistrationResponse {
  success: boolean;
  message?: string;
}
