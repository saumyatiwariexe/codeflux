import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';

// Helper to decode JWT
function decodeJWT(token: string) {
    try {
        const payload = token.split('.')[1];
        const decoded = Buffer.from(payload, 'base64').toString('utf8');
        return JSON.parse(decoded);
    } catch (e) {
        return null;
    }
}

const loginSchema = z.object({
  regNo: z.string().min(8, 'Invalid Registration Number'),
  password: z.string().min(1, 'Password is required'),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: z.infer<typeof loginSchema> }>('/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        data: null,
        error: body.error.errors[0].message,
      });
    }

    const { regNo, password } = body.data;
    const API_BASE = 'https://mobileapi.lpu.in';
    const payload = { Username: regNo, Password: password, DEVICE_ID: "Paladeium-App" };

    try {
      fastify.log.info(`Attempting to auth user: ${regNo}`);
      // 1. Fetch JWT Token from LPU Touch
      const tokenResponse = await fetch(`${API_BASE}/security/createToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; Pixel 4) LPUTouch/23.45'
        },
        body: JSON.stringify(payload)
      });
      
      const tokenData = await tokenResponse.json();

      if (tokenData.status === true && tokenData.token) {
        const decodedProfile = decodeJWT(tokenData.token);
        
        // Find or create the user row for this registration number.
        // We use regNo as the primary key as per AMD-010.
        const { data: existingUser, error: findError } = await supabase
          .from('users')
          .select('id')
          .eq('id', regNo)
          .maybeSingle();

        if (findError) {
          fastify.log.error(findError);
          return reply.status(500).send({ success: false, data: null, error: 'Database error' });
        }

        let isNewUser = false;
        
        if (!existingUser) {
          const { data: created, error: insertError } = await supabase
            .from('users')
            .insert({ id: regNo, email: `${regNo}@lpu.in`, is_active: true })
            .select('id')
            .single();

          if (insertError) {
            fastify.log.error(insertError);
            return reply.status(500).send({ success: false, data: null, error: 'Failed to create user' });
          }
          isNewUser = true;
          
          // create a dummy profile row as well
          await supabase.from('profiles').insert({
            id: regNo,
            handle: `user_${regNo}`,
            display_name: decodedProfile?.Name || regNo,
          });
        } else {
           const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', regNo)
            .maybeSingle();
           isNewUser = !profile?.onboarding_complete;
        }

        // Generate our own JWT
        const token = fastify.jwt.sign({ userId: regNo, role: 'student' }, { expiresIn: '7d' });

        return reply.status(200).send({
          success: true,
          data: {
            token,
            userId: regNo,
            isNewUser,
            name: decodedProfile?.Name || regNo,
          },
          error: null,
        });

      } else {
        return reply.status(401).send({
          success: false,
          data: null,
          error: tokenData.message || 'Login failed with LPU servers.'
        });
      }
    } catch (err: any) {
      fastify.log.error(`Proxy Error: ${err.message}`);
      return reply.status(500).send({
        success: false,
        data: null,
        error: "Connection Error to LPU servers",
      });
    }
  });

  fastify.delete('/logout', async (_request, reply) => {
    return reply.status(200).send({
      success: true,
      data: { message: 'Logged out successfully' },
      error: null,
    });
  });
};

export default authRoutes;
