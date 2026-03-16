import { z } from "zod";

import { AuthLoginBody } from "@/common/api/generate/authentication/authentication.zod.gen.ts";

export type LoginData = z.infer<typeof AuthLoginBody>;
