import jwt from "jsonwebtoken";


export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload, 
        process.env.JWT_DEFAULT_SECRATE_KEY, 
        { expiresIn: process.env.JWT_DEFAULT_EXPIRATION_TIME }
    );  
}

export const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload, 
        process.env.JWT_REFRESH_TOKEN_SECRATE_KEY, 
        { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME }
    );
}

export const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_DEFAULT_SECRATE_KEY);
}

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRATE_KEY);
}