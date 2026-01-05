import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    //VERIFIES JWT
    console.log("Auth middleware passed")
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({ message: "No token provided" });
        }

        // Format: "Bearer token"
        const token = authHeader.split(" ")[1];
        if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user info to request
        req.user = decoded;
        console.log("Decoded user:", decoded);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

export default authMiddleware;