import bcrypt from 'bcryptjs';
export class CredentialService {
    async comparePassword(userPassword: string, savedPassword: string) {
        return await bcrypt.compare(userPassword, savedPassword);
    }
}
