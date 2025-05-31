"use client";

import { useState, useEffect } from "react";
import { getTrace } from "../lib/api";
import { Trace, TraceStep } from "../lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Loader2, ArrowRight, Wrench, BrainCircuit, Users, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TraceViewerProps {
  traceId: string;
  isOpen: boolean;
  onClose: () => void;
  initialTraceData?: Trace | null;
}

export function TraceViewer({ traceId, isOpen, onClose, initialTraceData }: TraceViewerProps) {
  const [trace, setTrace] = useState<Trace | null>(initialTraceData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trace data when the component mounts or traceId changes
  useEffect(() => {
    if (isOpen && traceId) {
      // If initialTraceData is provided and its ID matches the current traceId, use it directly.
      if (initialTraceData && initialTraceData.id === traceId) {
        console.log(`TraceViewer: Using initialTraceData for ${traceId}`);
        setTrace(initialTraceData);
        setLoading(false);
        setError(null);
        return; // Skip fetching
      }
      
      // If we have a cached trace and its ID matches, but it wasn't the initial one (e.g. navigating back/forth)
      // Or if initialTraceData was for a different traceId
      if (trace && trace.id === traceId && !initialTraceData) { // Only re-use if not explicitly overridden by a different initialTraceData
          console.log(`TraceViewer: Re-using already loaded trace data for ${traceId}`);
          setLoading(false);
          setError(null);
          return;
      }

      console.log(`TraceViewer: Opening trace ${traceId}`);
      setLoading(true);
      setTrace(null); // Clear previous trace if IDs don't match
      setError(null);
      
      // Add retry logic with exponential backoff for better resilience
      const fetchTrace = async (retries = 3) => {
        try {
          console.log(`TraceViewer: Fetching trace ${traceId}, attempts left: ${retries}`);
          const data = await getTrace(traceId);
          console.log(`TraceViewer: Successfully loaded trace ${traceId}`);
          setTrace(data);
          setLoading(false);
        } catch (err) {
          console.error(`Error fetching trace (attempts left: ${retries}):`, err);
          
          if (retries > 0) {
            // Exponential backoff: wait longer between each retry
            const delay = 500 * Math.pow(2, 3 - retries);
            console.log(`TraceViewer: Retrying in ${delay}ms...`);
            
            setTimeout(() => fetchTrace(retries - 1), delay);
          } else {
            const errorMessage = err instanceof Error ? err.message : "Failed to load trace data";
            console.error(`TraceViewer: Failed to load trace after multiple attempts: ${errorMessage}`);
            setError(errorMessage);
            setLoading(false);
          }
        }
      };
      
      fetchTrace();
    }
  }, [traceId, isOpen, initialTraceData, trace]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col h-[80vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Reasoning Trace</DialogTitle>
          <DialogDescription>
            View the agent's step-by-step reasoning process for this response
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-destructive">Unable to load trace data</h3>
            <p className="text-muted-foreground max-w-md">
              {error}
            </p>
            <div className="text-sm text-muted-foreground mt-4">
              <p>Trace ID: {traceId}</p>
              <p className="mt-2">This might be because:</p>
              <ul className="list-disc list-inside mt-1 text-left">
                <li>The trace data is no longer available</li>
                <li>There was a network issue while loading</li>
                <li>The trace ID format is invalid</li>
              </ul>
            </div>
          </div>
        ) : trace ? (
          <Tabs defaultValue="steps" className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="steps">Reasoning Steps</TabsTrigger>
              <TabsTrigger value="tools">Tool Calls</TabsTrigger>
              <TabsTrigger value="handoffs">Agent Handoffs</TabsTrigger>
              <TabsTrigger value="classification">Classification</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            {/* Reasoning Steps Tab */}
            <TabsContent value="steps" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-4 p-4 min-h-full">
                  {trace.steps.map((step, index) => (
                    <StepCard key={index} step={step} index={index} />
                  ))}
                  <div className="h-20"></div> {/* Extra space to ensure content is scrollable */}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* Tool Calls Tab */}
            <TabsContent value="tools" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-4 p-4 min-h-full">
                  {trace.steps
                    .filter(step => step.tool || step.action)
                    .map((step, index) => (
                      <ToolCard key={index} step={step} index={index} />
                    ))}
                  <div className="h-20"></div> {/* Extra space to ensure content is scrollable */}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* Agent Handoffs Tab */}
            <TabsContent value="handoffs" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-4 p-4 min-h-full">
                  {(() => {
                    const handoffEvents = getHandoffEvents(trace);
                    return handoffEvents.length > 0 ? (
                      handoffEvents.map((handoff, index) => (
                        <HandoffCard key={index} handoff={handoff} index={index} />
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Agent Handoffs</h3>
                        <p>This issue was resolved without requiring handoffs between support teams.</p>
                      </div>
                    );
                  })()}
                  <div className="h-20"></div> {/* Extra space to ensure content is scrollable */}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* Classification Tab */}
            <TabsContent value="classification" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-4 min-h-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Issue Classification</CardTitle>
                      <CardDescription>
                        How the agent categorized this IT issue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {trace.classification ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Top Categories</h4>
                            <div className="flex flex-wrap gap-2">
                              {trace.classification.top_categories.map((category) => (
                                <Badge 
                                  key={category.category} 
                                  variant="outline"
                                  className="py-1"
                                >
                                  {category.category.replace(/_/g, ' ')}
                                  <span className="ml-1 opacity-70">
                                    {Math.round(category.confidence * 100)}%
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">All Categories</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(trace.classification.results)
                                .sort(([, valueA], [, valueB]) => valueB - valueA)
                                .map(([category, confidence]) => (
                                  <div 
                                    key={category} 
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <span>{category.replace(/_/g, ' ')}</span>
                                    <span className="text-muted-foreground">
                                      {Math.round(confidence as number * 100)}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          No classification data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="h-20"></div> {/* Extra space to ensure content is scrollable */}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* Summary Tab */}
            <TabsContent value="summary" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4 min-h-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Input Message</CardTitle>
                      <CardDescription>What the user asked</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-1" />
                        <div className="prose prose-sm dark:prose-invert">
                          {trace.input}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Final Response</CardTitle>
                      <CardDescription>The agent's answer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 mt-1" />
                        <div className="prose prose-sm dark:prose-invert">
                          {trace.final_output}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Process Stats</CardTitle>
                      <CardDescription>Metrics about this trace</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Total Steps</h4>
                          <p className="text-lg">{trace.steps.length}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Tool Calls</h4>
                          <p className="text-lg">
                            {trace.steps.filter(step => step.tool || step.action).length}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Trace ID</h4>
                          <p className="text-sm text-muted-foreground font-mono">{trace.id}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(trace.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="h-20"></div> {/* Extra space to ensure content is scrollable */}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to extract handoff events from trace
function getHandoffEvents(trace: Trace) {
  const handoffs = [];
  
  // Check trace.handoff_events array
  if (trace.handoff_events) {
    handoffs.push(...trace.handoff_events);
  }
  
  // Check steps for handoff tool calls
  trace.steps.forEach(step => {
    if (step.tool === "agent_handoff" || step.action === "agent_handoff") {
      const handoffData = step.tool_output || step.result;
      if (handoffData && typeof handoffData === 'object') {
        handoffs.push({
          ...handoffData,
          step_number: step.step || step.step_number,
          from_step: true
        });
      }
    }
    
    // Check for handoff events within steps
    if (step.handoff_event) {
      handoffs.push({
        ...step.handoff_event,
        step_number: step.step || step.step_number,
        from_step: true
      });
    }
  });
  
  return handoffs;
}

// Helper function to format team names
function formatTeamName(teamName: string): string {
  return teamName
    .replace(/_/g, ' ')
    .replace(/L\d+/g, (match) => match.toUpperCase())
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to get priority color
function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Helper function to get user type badge color
function getUserTypeBadgeColor(userType?: string): string {
  switch (userType) {
    case 'vip': return 'bg-purple-100 text-purple-800';
    case 'business_critical': return 'bg-orange-100 text-orange-800';
    case 'standard': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function HandoffCard({ handoff, index }: { handoff: Record<string, any>; index: number }) {
  const isApproved = handoff.handoff_approved;
  const requiresApproval = handoff.requires_approval;
  const isImmediate = handoff.immediate_assignment;
  
  return (
    <Card className={`border-2 ${isApproved ? 'border-green-200' : 'border-red-200'}`}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agent Handoff #{index + 1}
            {handoff.from_step && (
              <Badge variant="outline" className="text-xs">
                Step {handoff.step_number}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isApproved ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            {isImmediate && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-3 px-4 space-y-4">
        {/* Handoff Flow */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded">
            <Bot className="h-3 w-3" />
            <span className="font-medium">
              {formatTeamName(handoff.source_agent || 'L1 Agent')}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded">
            <Users className="h-3 w-3" />
            <span className="font-medium">
              {formatTeamName(handoff.target_team || handoff.target_agent || 'Unknown Team')}
            </span>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Status</h4>
            <Badge variant={isApproved ? "default" : "destructive"} className="text-xs">
              {isApproved ? "Approved" : "Rejected"}
            </Badge>
          </div>
          {handoff.sla_category && (
            <div>
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Priority</h4>
              <Badge className={`text-xs ${getPriorityColor(handoff.sla_category)}`}>
                {handoff.sla_category?.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        {/* Business Context */}
        {(handoff.business_impact || handoff.user_type) && (
          <div className="grid grid-cols-2 gap-4">
            {handoff.business_impact && (
              <div>
                <h4 className="text-xs font-medium mb-1 text-muted-foreground">Business Impact</h4>
                <Badge className={`text-xs ${getPriorityColor(handoff.business_impact)}`}>
                  {handoff.business_impact?.toUpperCase()}
                </Badge>
              </div>
            )}
            {handoff.user_type && (
              <div>
                <h4 className="text-xs font-medium mb-1 text-muted-foreground">User Type</h4>
                <Badge className={`text-xs ${getUserTypeBadgeColor(handoff.user_type)}`}>
                  {handoff.user_type?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Handoff Reason */}
        <div>
          <h4 className="text-xs font-medium mb-1 text-muted-foreground">Handoff Reason</h4>
          <p className="text-sm">{handoff.handoff_reason?.replace(/_/g, ' ')}</p>
        </div>

        {/* Timeline Information */}
        {(handoff.estimated_response_time || handoff.sla_target_minutes) && (
          <div className="bg-muted/50 p-3 rounded text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Timeline</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {handoff.estimated_response_time && (
                <div>
                  <span className="text-muted-foreground">Est. Response:</span>
                  <div>{handoff.estimated_response_time}</div>
                </div>
              )}
              {handoff.sla_target_minutes && (
                <div>
                  <span className="text-muted-foreground">SLA Target:</span>
                  <div>{Math.floor(handoff.sla_target_minutes / 60)}h {handoff.sla_target_minutes % 60}m</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approval Workflow */}
        {requiresApproval && handoff.approval_workflow && (
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Required Approvals</h4>
            <div className="flex flex-wrap gap-1">
              {handoff.approval_workflow.map((approval: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {approval.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Management Notification */}
        {handoff.management_notification && (
          <div className="flex items-center gap-2 text-sm bg-amber-50 p-2 rounded">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800">Management has been notified</span>
          </div>
        )}

        {/* Context Transfer Info */}
        {handoff.context_transferred && (
          <div className="text-xs text-muted-foreground">
            Context transferred: {handoff.context_size || 'N/A'} bytes
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StepCard({ step, index }: { step: TraceStep; index: number }) {
  // Function to render the step content based on the type
  const renderStepContent = () => {
    if (step.thought) {
      return (
        <div className="flex items-start gap-2">
          <BrainCircuit className="h-4 w-4 mt-1 text-blue-500" />
          <div>
            <div className="font-medium text-sm text-blue-500">Thought</div>
            <div className="mt-1 text-sm whitespace-pre-wrap">{step.thought}</div>
          </div>
        </div>
      );
    } else if (step.action || step.tool) {
      const toolName = step.action || step.tool || "";
      const toolInput = step.tool_input || step.result;
      
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <Wrench className="h-4 w-4 mt-1 text-amber-500" />
            <div>
              <div className="font-medium text-sm text-amber-500">Tool: {toolName}</div>
              {toolInput && (
                <div className="mt-1 text-sm bg-muted/50 p-2 rounded whitespace-pre-wrap overflow-x-auto">
                  {typeof toolInput === 'object' 
                    ? JSON.stringify(toolInput, null, 2) 
                    : String(toolInput)}
                </div>
              )}
            </div>
          </div>
          
          {(step.tool_output || step.result) && (
            <div className="flex items-start gap-2 ml-6">
              <ArrowRight className="h-4 w-4 mt-1 text-green-500" />
              <div>
                <div className="font-medium text-sm text-green-500">Result</div>
                <div className="mt-1 text-sm bg-muted/50 p-2 rounded whitespace-pre-wrap overflow-x-auto max-h-[300px] overflow-y-auto">
                  {typeof step.tool_output === 'object' || typeof step.result === 'object'
                    ? JSON.stringify(step.tool_output || step.result, null, 2)
                    : String(step.tool_output || step.result)}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="border-muted/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Step {index + 1}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {step.thought ? 'Reasoning' : step.action || step.tool ? 'Tool Call' : 'Other'}
            </Badge>
            {(step.tool === 'agent_handoff' || step.action === 'agent_handoff' || step.handoff_event) && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                <Users className="h-3 w-3 mr-1" />
                Handoff
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-3 px-4">
        {renderStepContent()}
      </CardContent>
    </Card>
  );
}

function ToolCard({ step, index }: { step: TraceStep; index: number }) {
  const toolName = step.action || step.tool || "";
  
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            {toolName}
          </CardTitle>
          <Badge variant="outline" className="text-xs">Step {index + 1}</Badge>
        </div>
      </CardHeader>
      <CardContent className="py-3 px-4 space-y-3">
        <div>
          <h4 className="text-xs font-medium mb-1 text-muted-foreground">Input</h4>
          <div className="text-sm bg-muted/50 p-2 rounded whitespace-pre-wrap overflow-x-auto max-h-[200px] overflow-y-auto">
            {typeof step.tool_input === 'object' || typeof step.result === 'object'
              ? JSON.stringify(step.tool_input || step.result, null, 2)
              : String(step.tool_input || step.result || "N/A")}
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-medium mb-1 text-muted-foreground">Output</h4>
          <div className="text-sm bg-muted/50 p-2 rounded whitespace-pre-wrap overflow-x-auto max-h-[200px] overflow-y-auto">
            {typeof step.tool_output === 'object' || typeof step.result === 'object'
              ? JSON.stringify(step.tool_output || step.result, null, 2)
              : String(step.tool_output || step.result || "N/A")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}