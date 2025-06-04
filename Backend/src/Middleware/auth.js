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
      console.log("getting the token : " ,value)
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




// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

// function verifyToken(req, res, next) {
//   try {
//     // Look for token in cookies
//     const cookieHeader = req.headers.cookie || '';
//     let token = null;

//     const cookies = cookieHeader.split(';');
//     for (let c of cookies) {
//       const [name, value] = c.trim().split('=');
//       if (name === 'Authtoken') {
//         token = value;
//         break;
//       }
//     }

//     // If not in cookies, check Authorization header
//     if (!token && req.headers.authorization?.startsWith('Bearer ')) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (!token) {
//       return res.status(401).json({ error: "Access denied. Token not found." });
//     }

//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     req.role = decoded.role;
//     req.email = decoded.email;
//     req.fullName = decoded.fullName;
//     req.userid = decoded.userid;

//     next();
//   } catch (error) {
//     console.error("Token verification error:", error);
//     res.status(401).json({ error: "Invalid or expired token" });
//   }
// }

// export { verifyToken };

