import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class UserController {
    async getSubscription(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { data, error } = await supabase
                .from('users')
                .select('subscription_tier, subscription_status')
                .eq('id', userId)
                .single();

            if (error) return res.status(404).json({ error: 'User not found' });
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async upgradeToPro(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { data, error } = await supabase
                .from('users')
                .update({ subscription_tier: 'PRO', subscription_status: 'active' })
                .eq('id', userId)
                .select()
                .single();

            if (error) return res.status(500).json({ error: error.message });
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateBranding(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { data, error } = await supabase
                .from('users')
                .update(req.body)
                .eq('id', userId)
                .select()
                .single();

            if (error) return res.status(500).json({ error: error.message });
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
