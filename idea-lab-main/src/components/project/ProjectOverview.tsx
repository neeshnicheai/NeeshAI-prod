import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, HelpCircle, Users, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import IdeaPulseCard from "./IdeaPulseCard";
import ValidationRing from "./ValidationRing";
import GapDetectionPanel from "./GapDetectionPanel";
import IdeaHealthScore from "./IdeaHealthScore";
import PersonaEngagementMatrix from "./PersonaEngagementMatrix";
import ConfusionAnalysis from "./ConfusionAnalysis";
import IterationTimeline from "./IterationTimeline";
import AISummaryCard from "./AISummaryCard";
import LinkedProjectsSection from "./LinkedProjectsSection";
import LinkProjectModal from "./LinkProjectModal";
import { generateShareableUrl } from "@/lib/slugify";
import { useAudienceData } from "@/hooks/useAudienceData";
import { useProjectLinks } from "@/hooks/useProjectLinks";

type ValidationStage = "early" | "gathering" | "detecting" | "refining" | "validated";
type PersonaType = "developer" | "marketer" | "investor" | "designer" | "entrepreneur" | "researcher" | "other";

interface ProjectOverviewProps {
  projectId: string;
  projectData: {
    title: string;
    summary?: string;
    description?: string;
    status: string;
  };
  feedbackData: Array<{
    name: string;
    occupation: string;
    feedback: string;
  }>;
  questionsData: Array<{
    question: string;
    count: number;
  }>;
  onDeleteProject?: () => void;
  isDeleting?: boolean;
}

// Timeline events
interface TimelineEvent {
  id: string;
  type: "knowledge_update" | "blog_update" | "gap_resolved";
  title: string;
  description: string;
  timestamp: Date;
  impactMetrics?: { questionsBefore: number; questionsAfter: number; gapsClosedCount: number };
}

// ===== Analytics computation from real data =====

function computeValidationStage(totalInteractions: number): ValidationStage {
  if (totalInteractions === 0) return "early";
  if (totalInteractions <= 5) return "gathering";
  if (totalInteractions <= 15) return "detecting";
  if (totalInteractions <= 30) return "refining";
  return "validated";
}

function computeHealthScores(
  feedbackCount: number,
  uniqueOccupations: number,
  totalQuestions: number,
  unansweredCount: number
) {
  const clarityIndex = Math.min(100, feedbackCount * 12);
  const marketSignal = Math.min(100, uniqueOccupations * 20);
  const gapVelocity = Math.max(0, 100 - unansweredCount * 15);
  const validationMomentum = Math.round((clarityIndex + marketSignal + gapVelocity) / 3);

  return { clarityIndex, marketSignal, gapVelocity, validationMomentum };
}

function computeGaps(questionsData: Array<{ question: string; count: number }>) {
  // Each question cluster with count > 1 is an active gap
  return questionsData
    .filter(q => q.count > 1)
    .map((q, i) => ({
      id: `gap-${i}`,
      topic: q.question,
      questionCount: q.count,
      personas: ["other" as PersonaType],
      severity: (q.count >= 5 ? "high" : q.count >= 3 ? "medium" : "low") as "low" | "medium" | "high",
      isResolved: false,
    }));
}

function computeConfusionPatterns(questionsData: Array<{ question: string; count: number }>) {
  // Top repeated questions become confusion patterns
  return questionsData
    .filter(q => q.count >= 2)
    .slice(0, 5)
    .map((q, i) => ({
      id: `pattern-${i}`,
      topic: q.question,
      questionCount: q.count,
      personas: ["other" as PersonaType],
      suggestedContent: `Add content addressing: "${q.question}"`,
      contentType: "knowledge" as const,
    }));
}

function computeSummary(
  feedbackCount: number,
  totalQuestions: number,
  uniqueOccupations: number,
  validationStage: ValidationStage,
  projectSummary?: string,
  projectDescription?: string
): { summary: string; strengths: string[]; opportunities: string[]; nextSteps: string[] } {
  const strengths: string[] = [];
  const opportunities: string[] = [];
  const nextSteps: string[] = [];

  // Build strengths
  if (feedbackCount > 0) strengths.push(`${feedbackCount} feedback response${feedbackCount > 1 ? "s" : ""} received from your audience`);
  if (uniqueOccupations >= 3) strengths.push(`Diverse audience spanning ${uniqueOccupations} different occupations`);
  if (totalQuestions > 0) strengths.push(`${totalQuestions} question${totalQuestions > 1 ? "s" : ""} asked — users are actively engaging`);
  if (strengths.length === 0) strengths.push("Project is set up and ready to receive feedback");

  // Build opportunities
  if (feedbackCount === 0) opportunities.push("Share your blog link to start collecting feedback");
  if (totalQuestions === 0) opportunities.push("Encourage visitors to ask questions via the chatbot");
  if (uniqueOccupations < 3) opportunities.push("Reach out to more diverse audiences for broader validation");
  if (totalQuestions > 5) opportunities.push("Review frequently asked questions and update your knowledge base");

  // Build next steps
  if (validationStage === "early") {
    nextSteps.push("Share your public blog link with potential users");
    nextSteps.push("Upload documents to your knowledge base to power the chatbot");
  } else if (validationStage === "gathering") {
    nextSteps.push("Review incoming feedback and identify common themes");
    nextSteps.push("Address frequently asked questions in your knowledge base");
  } else if (validationStage === "detecting") {
    nextSteps.push("Focus on knowledge gaps — many questions indicate areas needing more content");
    nextSteps.push("Analyze persona-specific feedback patterns");
  } else {
    nextSteps.push("Iterate on your idea based on validated insights");
    nextSteps.push("Consider expanding your audience reach for further validation");
  }

  const stageText: Record<ValidationStage, string> = {
    early: "Your project is in early stages. Share your blog link to start gathering audience insights.",
    gathering: "Feedback is starting to come in! Your idea is generating initial interest from your audience.",
    detecting: "Patterns are emerging in your audience engagement. Review the gaps detected below for actionable insights.",
    refining: "Strong validation signal! Your audience is actively engaging and providing meaningful feedback.",
    validated: "Excellent validation! Your idea has significant traction with a diverse, engaged audience.",
  };

  // Build summary: project description + validation status
  const descText = (projectSummary && projectSummary.trim()) || (projectDescription && projectDescription.trim()) || "";
  const descriptionPart = descText ? descText.slice(0, 200) + " — " : "";

  return {
    summary: descriptionPart + stageText[validationStage],
    strengths,
    opportunities,
    nextSteps,
  };
}

// ===== Component =====

const ProjectOverview = ({ projectId, projectData, feedbackData, questionsData, onDeleteProject, isDeleting }: ProjectOverviewProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Use real audience data from backend
  const {
    members: audienceMembers,
    loading: audienceLoading,
    stats: audienceStats,
    getAggregatedPersonaData,
    refetch,
  } = useAudienceData(projectId);

  // Project links
  const { linkedProjects, loading: linksLoading, linkProject, unlinkProject } = useProjectLinks(projectId);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  // ===== Compute all analytics locally from real data =====

  const totalFeedback = audienceStats.totalFeedback + feedbackData.length;
  const totalQuestions = questionsData.reduce((sum, q) => sum + q.count, 0);
  const unansweredQuestions = questionsData.filter(q => q.count >= 2).length;
  const uniqueOccupations = audienceStats.uniqueOccupations || new Set(feedbackData.map(f => f.occupation).filter(Boolean)).size;
  const totalInteractions = totalFeedback + totalQuestions;

  const validationStage = useMemo(() => computeValidationStage(totalInteractions), [totalInteractions]);
  const healthScores = useMemo(
    () => computeHealthScores(totalFeedback, uniqueOccupations, totalQuestions, unansweredQuestions),
    [totalFeedback, uniqueOccupations, totalQuestions, unansweredQuestions]
  );
  const activeGaps = useMemo(() => computeGaps(questionsData), [questionsData]);
  const confusionPatterns = useMemo(() => computeConfusionPatterns(questionsData), [questionsData]);
  const aiSummary = useMemo(
    () => computeSummary(totalFeedback, totalQuestions, uniqueOccupations, validationStage, projectData.summary, projectData.description),
    [totalFeedback, totalQuestions, uniqueOccupations, validationStage, projectData.summary, projectData.description]
  );

  // Build persona engagement from real audience data
  const aggregatedPersonas = getAggregatedPersonaData();
  const personaEngagement = useMemo(() => {
    if (aggregatedPersonas.length > 0) {
      return aggregatedPersonas.map(p => ({
        persona: p.persona as PersonaType,
        visited: p.members,
        asked: 0, // Real question counts not tracked per persona yet
        feedback: p.feedbackCount,
        returned: 0, // Return visits not tracked yet
      }));
    }
    // Fallback: derive from feedbackData props
    const personaCounts: Record<string, { visited: number; feedback: number }> = {};
    feedbackData.forEach(f => {
      const persona = f.occupation?.toLowerCase() || "other";
      if (!personaCounts[persona]) personaCounts[persona] = { visited: 0, feedback: 0 };
      personaCounts[persona].visited++;
      personaCounts[persona].feedback++;
    });
    return Object.entries(personaCounts).map(([persona, data]) => ({
      persona: persona as PersonaType,
      visited: data.visited,
      asked: 0,
      feedback: data.feedback,
      returned: 0,
    }));
  }, [aggregatedPersonas, feedbackData]);

  // Timeline events (from real data when available)
  const timelineEvents = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    if (audienceMembers.length > 0) {
      // Find earliest interaction
      const earliest = audienceMembers.reduce((min, m) =>
        m.first_interaction_at < min ? m.first_interaction_at : min,
        audienceMembers[0].first_interaction_at
      );
      events.push({
        id: "first-interaction",
        type: "knowledge_update",
        title: "First audience interaction",
        description: `First visitor engaged with your project`,
        timestamp: new Date(earliest),
      });
    }
    if (totalFeedback > 0) {
      events.push({
        id: "first-feedback",
        type: "blog_update",
        title: `${totalFeedback} feedback responses received`,
        description: `Audience is actively providing feedback on your idea`,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
    }
    return events;
  }, [audienceMembers, totalFeedback]);

  // Find last interaction time
  const lastInteractionAt = useMemo(() => {
    if (audienceMembers.length > 0) {
      const latest = audienceMembers.reduce((max, m) =>
        m.last_interaction_at > max ? m.last_interaction_at : max,
        audienceMembers[0].last_interaction_at
      );
      return new Date(latest);
    }
    return null; // No interactions yet — don't fake a date
  }, [audienceMembers]);

  // ===== Handlers =====

  const handleShare = () => {
    // generateShareableUrl(projectId, projectTitle) — correct arg order
    const url = generateShareableUrl(projectId, projectData.title);
    navigator.clipboard.writeText(url);
    toast.success("Link copied!", { description: "Shareable link copied to clipboard" });
  };

  const handleViewBlog = () => {
    // Open the public blog URL (same as share link)
    const url = generateShareableUrl(projectId, projectData.title);
    window.open(url, "_blank");
  };

  const handleTestChatbot = () => {
    navigate(`/project/${projectId}/chatbot`);
  };

  const handleFixGap = (gapId: string) => {
    toast.info("Opening Knowledge Base", { description: "Add content to address this gap" });
  };

  const handleAddContent = (patternId: string, type: "blog" | "knowledge") => {
    if (type === "blog") {
      navigate(`/project/${projectId}/blog`);
    } else {
      toast.info("Opening Knowledge Base");
    }
  };

  const loopHealth = Math.round((healthScores.clarityIndex + healthScores.gapVelocity) / 2);

  // ===== Render =====

  if (audienceLoading) {
    return (
      <div className="space-y-4 max-w-[1200px] mx-auto">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* 1. Idea Pulse Card - Hero Section */}
      <IdeaPulseCard
        title={projectData.title}
        summary={projectData.summary}
        status={projectData.status}
        validationStage={validationStage}
        lastInteractionAt={lastInteractionAt}
        onShare={handleShare}
        onViewBlog={handleViewBlog}
        onTestChatbot={handleTestChatbot}
        onLinkProject={() => setLinkModalOpen(true)}
      />

      {/* 2. AI Summary Card - Computed from real data */}
      <AISummaryCard
        summary={aiSummary.summary}
        strengths={aiSummary.strengths}
        opportunities={aiSummary.opportunities}
        nextSteps={aiSummary.nextSteps}
        validationStage={validationStage}
      />

      {/* Link Project Modal */}
      <LinkProjectModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        currentProjectId={projectId}
        alreadyLinkedIds={linkedProjects.map((p) => p.projectId)}
        onLinkProject={linkProject}
      />

      {/* 3. Main Content Grid - LinkedProjects, ValidationRing and Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linked Projects - spans full width above validation */}
        <div className="lg:col-span-2">
          <LinkedProjectsSection
            linkedProjects={linkedProjects}
            loading={linksLoading}
            onUnlink={unlinkProject}
          />
        </div>

        {/* Validation Ring */}
        <ValidationRing
          visitors={audienceStats.totalMembers || feedbackData.length}
          questions={totalQuestions}
          feedback={totalFeedback}
          gaps={activeGaps.length}
          knowledgeItems={timelineEvents.filter(e => e.type === "knowledge_update").length}
          loopHealth={loopHealth}
          onNodeClick={(nodeId) => {
            if (nodeId === "gaps") handleFixGap("");
            else if (nodeId === "blog") handleViewBlog();
            else if (nodeId === "chatbot") handleTestChatbot();
          }}
        />

        {/* Health Score */}
        <IdeaHealthScore
          clarityIndex={healthScores.clarityIndex}
          marketSignal={healthScores.marketSignal}
          gapVelocity={healthScores.gapVelocity}
          validationMomentum={healthScores.validationMomentum}
        />
      </div>

      {/* 4. Gap Detection Panel */}
      <GapDetectionPanel
        activeGaps={activeGaps}
        resolvedGaps={[]}
        onFixGap={handleFixGap}
      />

      {/* 5. Confusion Analysis */}
      <ConfusionAnalysis
        patterns={confusionPatterns}
        onAddContent={handleAddContent}
      />

      {/* 6. Persona Engagement Matrix */}
      <PersonaEngagementMatrix
        engagementData={personaEngagement}
        onPersonaClick={(persona) => {
          toast.info(`Viewing ${persona} insights`);
        }}
      />

      {/* 7. Iteration Timeline */}
      <IterationTimeline
        events={timelineEvents}
        totalIterations={timelineEvents.length}
      />

      {/* 8. Danger Zone — Delete Project */}
      {onDeleteProject && (
        <div className="border border-destructive/20 bg-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-destructive" />
                Delete Project
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete this project and all associated data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>"{projectData.title}"</strong>? This action cannot be undone. All project data, linked projects, and associated content will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setShowDeleteDialog(false);
                      onDeleteProject();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Deleting...</>
                    ) : (
                      "Delete Project"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;
