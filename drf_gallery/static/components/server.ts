// file server.ts
import { rollup } from "https://deno.land/x/drollup@2.41.0+0.16.1/mod.ts";
import { serve } from 'https://deno.land/std/http/server.ts'

const s = serve({ port: 8000 })
console.log('Server listening on port :8000')
for await (const req of s) {
  req.respond({ body: 'Hello Deno!\n' })
}
