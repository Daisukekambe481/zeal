/**
  * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */import { db } from "../db/index.js";
 import { user } from "../db/schema.js"; // Fixed: matches your 'user' export
 import { eq } from "drizzle-orm";
 
 const isAuthenticated = async (req, res, next) => {
   // 1. Check if Passport has authenticated the session
   if (req.isAuthenticated()) {
     return next();
   }
 
   // 2. Fallback: Check for Bearer Token in headers (for API requests)
   const authHeader = req.headers.authorization;
   if (authHeader && authHeader.startsWith("Bearer ")) {
     const token = authHeader.split(" ")[1];
 
     try {
       // Logic to find user by token (Example: checking refreshToken or session)
       const foundUser = await db
         .select()
         .from(user) // Fixed: matches your singular 'user' table
         .where(eq(user.refreshToken, token))
         .limit(1);
 
       if (foundUser.length > 0) {
         req.user = foundUser[0];
         return next();
       }
     } catch (error) {
       console.error("Auth Middleware Error:", error);
     }
   }
 
   return res.status(401).json({ 
     success: false, 
     message: "Unauthorized: Please log in to access this resource" 
   });
 };
 
export default isAuthenticated; 
export const logout = async (req, res) => {
  try {
    const userId = req.user.id
    const token  = req.headers.authorization?.split(' ')[1]

    const [user] = await db.select().from(users).where(eq(users.id, userId))

    // Add current access token to blacklist
    const blacklist = user.blacklisted_tokens || []
    if (token && !blacklist.includes(token)) {
      blacklist.push(token)
    }

    await db.update(users)
      .set({ refresh_token: null, blacklisted_tokens: blacklist })
      .where(eq(users.id, userId))

    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}