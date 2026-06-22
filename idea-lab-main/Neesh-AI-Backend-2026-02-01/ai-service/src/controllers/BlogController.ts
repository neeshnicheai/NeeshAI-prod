import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class BlogController {
    async getBlog(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('project_id', projectId)
                .single();

            if (error) return res.status(404).json({ error: 'Blog not found' });
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async upsertBlog(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const body = req.body;

            const { data, error } = await supabase
                .from('blogs')
                .upsert({ ...body, project_id: projectId }, { onConflict: 'project_id' })
                .select()
                .single();

            if (error) return res.status(500).json({ error: error.message });
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getPublicBlog(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('project_id', projectId)
                .single();

            if (error) return res.status(404).json({ error: 'Blog not found' });
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
