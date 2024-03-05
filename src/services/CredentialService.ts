import bcrypt from 'bcrypt';
export class CredentialService {
    async comparePassword(userPassword: string, savedPassword: string) {
        return await bcrypt.compare(userPassword, savedPassword);
    }
}
