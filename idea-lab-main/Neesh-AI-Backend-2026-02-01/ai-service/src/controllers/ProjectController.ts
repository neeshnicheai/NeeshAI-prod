import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

interface CreateProjectRequest {
    title: string;
    oneLineSummary: string;
    introduction?: string;
    description?: string;
}

interface UpdateProjectRequest extends CreateProjectRequest {
    status?: string;
}

export class ProjectController {
    async getProjects(req: Request, res: Response) {
        try {
            console.log('[ProjectController] Getting projects for user:', req.user?.id);

            const { data: projects, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', req.user?.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[ProjectController] Database error:', error);
                return res.status(500).json({ error: 'Failed to fetch projects' });
            }

            console.log('[ProjectController] Retrieved projects:', projects?.length || 0);
            res.json(projects || []);
        } catch (error) {
            console.error('[ProjectController] Error getting projects:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createProject(req: Request, res: Response) {
        try {
            const { title, oneLineSummary, introduction, description }: CreateProjectRequest = req.body;

            console.log('[ProjectController] Creating project:', { title, oneLineSummary });

            if (!title || !oneLineSummary) {
                return res.status(400).json({ error: 'Title and summary are required' });
            }

            const projectData = {
                user_id: req.user?.id,
                title,
                one_line_summary: oneLineSummary,
                introduction: introduction || null,
                description: description || null,
                status: 'draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: project, error } = await supabase
                .from('projects')
                .insert(projectData)
                .select()
                .single();

            if (error) {
                console.error('[ProjectController] Database error:', error);
                return res.status(500).json({ error: 'Failed to create project' });
            }

            console.log('[ProjectController] Created project:', project.id);
            res.status(201).json(project);
        } catch (error) {
            console.error('[ProjectController] Error creating project:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getProject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log('[ProjectController] Getting project:', id);

            const { data: project, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .eq('user_id', req.user?.id)
                .single();

            if (error) {
                console.error('[ProjectController] Database error:', error);
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json(project);
        } catch (error) {
            console.error('[ProjectController] Error getting project:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateProject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, oneLineSummary, introduction, description, status }: UpdateProjectRequest = req.body;

            console.log('[ProjectController] Updating project:', id);

            const updateData: any = {
                updated_at: new Date().toISOString()
            };

            if (title !== undefined) updateData.title = title;
            if (oneLineSummary !== undefined) updateData.one_line_summary = oneLineSummary;
            if (introduction !== undefined) updateData.introduction = introduction;
            if (description !== undefined) updateData.description = description;
            if (status !== undefined) updateData.status = status;

            const { data: project, error } = await supabase
                .from('projects')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', req.user?.id)
                .select()
                .single();

            if (error) {
                console.error('[ProjectController] Database error:', error);
                return res.status(404).json({ error: 'Project not found or update failed' });
            }

            console.log('[ProjectController] Updated project:', project.id);
            res.json(project);
        } catch (error) {
            console.error('[ProjectController] Error updating project:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteProject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log('[ProjectController] Deleting project:', id);

            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id)
                .eq('user_id', req.user?.id);

            if (error) {
                console.error('[ProjectController] Database error:', error);
                return res.status(404).json({ error: 'Project not found' });
            }

            console.log('[ProjectController] Deleted project:', id);
            res.status(204).send();
        } catch (error) {
            console.error('[ProjectController] Error deleting project:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}