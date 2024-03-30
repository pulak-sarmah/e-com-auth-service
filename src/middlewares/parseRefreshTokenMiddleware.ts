import { Request } from 'express';
import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { AuthCookie } from '../types';

if (!Config.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
}

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET,
    algorithms: ['HS256'],

    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
});
