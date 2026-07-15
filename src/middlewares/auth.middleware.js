import jwt from 'jsonwebtoken';


export const loginMidleware = (req, res, next) => {
    try {
        const defaultToken = req.headers.authorization;

        if(!defaultToken || !defaultToken.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "UnAthorized Request"
            });
        }

        const token = defaultToken.split(' ')[1];

        if(token !== process.env.JWT_DEFAULT_SECRATE_KEY) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
            })
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid Default Token"
        })
    }
}


export const authMiddleware = (req, res, next) => {
    console.log("header token", req.headers.authorization.split(' ')[1])
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access Token Required",
            })
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "UnAthorized access",
            })
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_DEFAULT_SECRATE_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("error", error)
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}