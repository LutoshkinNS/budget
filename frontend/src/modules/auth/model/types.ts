import { z } from "zod";

import { authLoginBody } from "@/common/api/generate/authentication/authentication.zod.gen.ts";

export type LoginData = z.infer<typeof authLoginBody>;
