
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Question {
    id: string;
    projectId: string;
    question: string;
    createdAt: string;
    isResolved: boolean;
}

interface QuestionResponse {
    questions: Question[];
    count: number;
}

export const useQuestions = (projectId: string | undefined) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUnansweredQuestions = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const session = await supabase.auth.getSession();
            const token = session.data?.session?.access_token;
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

            const response = await fetch(`${backendUrl}/api/projects/${projectId}/questions/unanswered`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data: QuestionResponse = await response.json();
                setQuestions(data.questions);
            }
        } catch (err) {
            console.error("Error fetching questions:", err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const reportQuestion = async (questionText: string) => {
        if (!projectId) return;
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";
            // Public endpoint, no auth header needed for reporting
            await fetch(`${backendUrl}/api/public/projects/${projectId}/questions/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ question: questionText })
            });
        } catch (err) {
            console.error("Error reporting question:", err);
        }
    };

    const resolveQuestion = async (questionId: string) => {
        try {
            const session = await supabase.auth.getSession();
            const token = session.data?.session?.access_token;
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

            const response = await fetch(`${backendUrl}/api/questions/${questionId}/resolve`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setQuestions(prev => prev.filter(q => q.id !== questionId));
                toast.success("Question resolved");
            }
        } catch (err) {
            console.error("Error resolving question:", err);
            toast.error("Failed to resolve question");
        }
    };

    return {
        questions,
        loading,
        fetchUnansweredQuestions,
        reportQuestion,
        resolveQuestion
    };
};
