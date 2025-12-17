import { z } from "zod";

import { authLoginBody } from "@/kernel/api/generate/authentication/authentication.zod.gen.ts";

export type LoginData = z.infer<typeof authLoginBody>;
