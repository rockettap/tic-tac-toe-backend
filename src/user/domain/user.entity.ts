export class User {
  constructor(
    public readonly id: string,
    private _email: string,
    private _passwordHash: string,
  ) {}

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  toJSON(): object {
    return {
      id: this.id,
      email: this._email,
    };
  }
}
