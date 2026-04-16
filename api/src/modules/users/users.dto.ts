export class UpdateUserDto {
  name?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}
