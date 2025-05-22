import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function verifyToken(req, res, next) {
  // Get token from cookie or Authorization header
  const cookies =req.headers.cookie;
  const cookie=cookies.split(';')
  for(let cooki of cookie){
    const [name,value] = cooki.trim().split('=');
    if(name=='Authtoken'){
  // const token =
  //   req.cookies.Authtoken ||
  //   (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  // if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(value, process.env.SECRET_KEY);
    req.role = decoded.role;
    req.email = decoded.email;
    req.fullName = decoded.fullName;
    req.userid = decoded.userid;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
}
  }}
export { verifyToken };
