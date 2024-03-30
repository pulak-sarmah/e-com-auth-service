import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

export class TokenService {
    constructor(private refreshTokenRepo: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
        if (!Config.PRIVATE_KEY) {
            const err = createHttpError(500, 'KEY is not defined');
            throw err;
        }
        let privateKey: string;
        try {
            privateKey = Config.PRIVATE_KEY;
        } catch (error) {
            const err = createHttpError(500, 'error while reading privateKey');
            throw err;
        }

        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });
        return accessToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

        const newRefreshToken = await this.refreshTokenRepo.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        return newRefreshToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        if (!Config.REFRESH_TOKEN_SECRET) {
            throw new Error('REFRESH_TOKEN_SECRET is not defined');
        }
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    async deleteRefreshToken(tokenId: number) {
        return await this.refreshTokenRepo.delete({ id: tokenId });
    }
}
