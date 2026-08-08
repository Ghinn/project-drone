import type { DecodedIdToken } from "firebase-admin/auth";
import type { User } from "../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      firebaseToken?: DecodedIdToken;
      currentUser?: User;
    }
  }
}

export {};