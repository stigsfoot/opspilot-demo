"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageAttachment } from "../lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowUpRight, 
  MonitorSmartphone,
  FileCode,
  ScrollText,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  Wrench,
  Settings
} from "lucide-react";

interface MessageImagesProps {
  images: ImageAttachment[];
  className?: string;
}

export function MessageImages({ images, className }: MessageImagesProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Open image dialog
  const openImageDialog = (index: number) => {
    setSelectedImageIndex(index);
  };

  // Close image dialog
  const closeImageDialog = () => {
    setSelectedImageIndex(null);
  };

  // Get the currently selected image
  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

  // Format the analysis results
  const formatAnalysisResult = (key: string, value: any): string => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value);
  };

  return (
    <>
      {/* Thumbnails */}
      <div className={`flex flex-wrap gap-2 mt-2 ${className}`}>
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="relative cursor-pointer group"
            onClick={() => openImageDialog(index)}
          >
            <img
              src={image.url}
              alt={image.name}
              className="h-16 w-16 object-cover rounded-md border border-border hover:border-primary transition-colors"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-white" />
            </div>
            {image.analysisResults && (
              <Badge variant="secondary" className="absolute -bottom-2 -right-2 text-xs">
                Analyzed
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Image dialog */}
      {selectedImage && (
        <Dialog open={selectedImageIndex !== null} onOpenChange={closeImageDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>{selectedImage.name}</DialogTitle>
              <DialogDescription>
                {selectedImage.analysisResults ? "AI-analyzed screenshot" : "Screenshot attachment"}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="image" className="flex-1 overflow-hidden flex flex-col">
              <TabsList>
                <TabsTrigger value="image">
                  <MonitorSmartphone className="h-4 w-4 mr-2" />
                  Image
                </TabsTrigger>
                {selectedImage.analysisResults && (
                  <>
                    <TabsTrigger value="analysis">
                      <FileCode className="h-4 w-4 mr-2" />
                      Analysis
                    </TabsTrigger>
                    {selectedImage.analysisResults.suggested_actions && (
                      <TabsTrigger value="actions">
                        <ScrollText className="h-4 w-4 mr-2" />
                        Actions
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="details">
                      <ScrollText className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Image tab */}
              <TabsContent value="image" className="flex-1 flex items-center justify-center p-4 overflow-auto">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-w-full max-h-full object-contain"
                />
              </TabsContent>

              {/* Analysis tab */}
              {selectedImage.analysisResults && (
                <TabsContent value="analysis" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {/* Key findings */}
                      {selectedImage.analysisResults.content_type && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Content Type</h3>
                          <Badge variant="outline" className="text-sm py-1 px-2">
                            {selectedImage.analysisResults.content_type}
                          </Badge>
                        </div>
                      )}

                      {/* Extracted text */}
                      {selectedImage.analysisResults.extracted_text && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Extracted Text</h3>
                          <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap font-mono">
                            {selectedImage.analysisResults.extracted_text}
                          </div>
                        </div>
                      )}

                      {/* Analysis summary */}
                      {selectedImage.analysisResults.analysis && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Analysis</h3>
                          <p className="text-sm">{selectedImage.analysisResults.analysis}</p>
                        </div>
                      )}

                      {/* Preprocessing information */}
                      {selectedImage.analysisResults.preprocessing && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Image Processing</h3>
                          <div className="bg-muted p-3 rounded-md">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="font-medium text-muted-foreground">Type:</div>
                              <div className="font-mono">{selectedImage.analysisResults.preprocessing.type}</div>
                              
                              <div className="font-medium text-muted-foreground">Enhancement:</div>
                              <div>
                                <Badge variant="outline" className="font-mono">
                                  {selectedImage.analysisResults.preprocessing.enhancement_level}
                                </Badge>
                              </div>
                              
                              {selectedImage.analysisResults.preprocessing.original_size && (
                                <>
                                  <div className="font-medium text-muted-foreground">Original Size:</div>
                                  <div className="font-mono">
                                    {Array.isArray(selectedImage.analysisResults.preprocessing.original_size) ? 
                                      `${selectedImage.analysisResults.preprocessing.original_size[0]}×${selectedImage.analysisResults.preprocessing.original_size[1]}` :
                                      JSON.stringify(selectedImage.analysisResults.preprocessing.original_size)}
                                  </div>
                                </>
                              )}
                              
                              {selectedImage.analysisResults.preprocessing.processed_size && (
                                <>
                                  <div className="font-medium text-muted-foreground">Processed Size:</div>
                                  <div className="font-mono">
                                    {Array.isArray(selectedImage.analysisResults.preprocessing.processed_size) ? 
                                      `${selectedImage.analysisResults.preprocessing.processed_size[0]}×${selectedImage.analysisResults.preprocessing.processed_size[1]}` :
                                      JSON.stringify(selectedImage.analysisResults.preprocessing.processed_size)}
                                  </div>
                                </>
                              )}
                              
                              {selectedImage.analysisResults.preprocessing.timestamp && (
                                <>
                                  <div className="font-medium text-muted-foreground">Processed:</div>
                                  <div className="text-xs text-muted-foreground">
                                    {selectedImage.analysisResults.preprocessing.timestamp}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detected elements */}
                      {selectedImage.analysisResults.ui_elements && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Detected UI Elements</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedImage.analysisResults.ui_elements.map((element: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-sm py-1">
                                {element}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Status indicators - used for hardware images */}
                      {selectedImage.analysisResults.status_indicators && 
                       Array.isArray(selectedImage.analysisResults.status_indicators) && 
                       selectedImage.analysisResults.status_indicators.some((indicator: any) => typeof indicator === 'object') && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Status Indicators</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedImage.analysisResults.status_indicators.map((indicator: any, i: number) => {
                              // Determine icon based on state
                              let StateIcon = Info;
                              let stateColor = "text-blue-500";
                              
                              if (indicator.state) {
                                const state = indicator.state.toLowerCase();
                                if (state.includes("error") || state.includes("failed") || state.includes("critical")) {
                                  StateIcon = AlertCircle;
                                  stateColor = "text-red-500";
                                } else if (state.includes("warning") || state.includes("attention")) {
                                  StateIcon = AlertTriangle;
                                  stateColor = "text-amber-500";
                                } else if (state.includes("ok") || state.includes("normal") || state.includes("good")) {
                                  StateIcon = Check;
                                  stateColor = "text-green-500";
                                }
                              }
                              
                              return (
                                <div key={i} className="bg-muted p-2 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full flex-shrink-0" 
                                      style={{backgroundColor: indicator.color || 'gray'}}
                                    />
                                    <span className="font-medium">{indicator.label || 'Indicator'}</span>
                                    <div className={`flex items-center gap-1 ${stateColor}`}>
                                      <StateIcon className="h-3.5 w-3.5" />
                                      <span className="text-sm">
                                        {indicator.state || ''} 
                                      </span>
                                    </div>
                                    {indicator.location && (
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {indicator.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Error codes */}
                      {selectedImage.analysisResults.error_codes && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Error Codes</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedImage.analysisResults.error_codes.map((code: string, i: number) => {
                              // Get detailed error info if available
                              const errorDetails = selectedImage.analysisResults.error_details || {};
                              const details = typeof errorDetails === 'object' ? 
                                (errorDetails.code === code ? errorDetails : null) : null;
                                
                              return (
                                <TooltipProvider key={i}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge 
                                        variant="destructive" 
                                        className={`text-sm py-1 cursor-help ${details?.severity === 'critical' ? 'bg-red-600' : ''}`}
                                      >
                                        {code} {details?.name ? `(${details.name})` : ''}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <div className="space-y-1">
                                        {details?.description ? (
                                          <p>{details.description}</p>
                                        ) : (
                                          <p>Error code detected in the image</p>
                                        )}
                                        {details?.severity && (
                                          <div className="text-xs">
                                            Severity: <span className={`font-medium ${details.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                                              {details.severity}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Visible issues - used for hardware images */}
                      {selectedImage.analysisResults.visible_issues && 
                       Array.isArray(selectedImage.analysisResults.visible_issues) && 
                       selectedImage.analysisResults.visible_issues.some((issue: any) => typeof issue === 'object') && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Visible Issues</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedImage.analysisResults.visible_issues.map((issue: any, i: number) => {
                              // Determine icon based on issue type
                              let IssueIcon = AlertCircle;
                              
                              if (issue.type) {
                                const type = issue.type.toLowerCase();
                                if (type.includes("mechanical") || type.includes("physical")) {
                                  IssueIcon = Wrench;
                                } else if (type.includes("connectivity") || type.includes("network")) {
                                  IssueIcon = Settings;
                                }
                              }
                              
                              return (
                                <div key={i} className="bg-muted/50 p-3 rounded-md border border-destructive/30">
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <IssueIcon className="h-5 w-5 text-destructive" />
                                    </div>
                                    <div className="flex-grow">
                                      <div className="flex items-baseline gap-2">
                                        <span className="font-medium">{issue.component || 'Component'}</span>
                                        <span className="text-sm text-destructive">
                                          {issue.condition || 'Issue detected'}
                                        </span>
                                      </div>
                                      {issue.type && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          Issue type: {issue.type}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}

              {/* Actions tab */}
              {selectedImage.analysisResults && selectedImage.analysisResults.suggested_actions && (
                <TabsContent value="actions" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-6">
                      {/* Suggested actions */}
                      {selectedImage.analysisResults.suggested_actions && 
                      Array.isArray(selectedImage.analysisResults.suggested_actions) && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Suggested Actions</h3>
                          <div className="space-y-2">
                            {selectedImage.analysisResults.suggested_actions.map((action: any, i: number) => {
                              // Handle both string and object formats for actions
                              const actionContent = typeof action === 'string' ? action : action.action || '';
                              const difficulty = typeof action === 'object' ? action.difficulty : null;
                              const detail = typeof action === 'object' ? action.detail : null;
                              
                              return (
                                <div key={i} className="flex items-start gap-2 p-3 rounded-md bg-primary/5 border border-primary/20">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                  </div>
                                  <div className="space-y-1">
                                    <div>{actionContent}</div>
                                    {(difficulty || detail) && (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {difficulty && (
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs py-0.5 ${difficulty === 'easy' ? 'text-green-500' : difficulty === 'medium' ? 'text-amber-500' : 'text-red-500'}`}
                                          >
                                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                          </Badge>
                                        )}
                                        {detail && <span>{detail}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Confidence scores */}
                      {selectedImage.analysisResults.confidence && 
                      typeof selectedImage.analysisResults.confidence === 'object' && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Confidence Scores</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(selectedImage.analysisResults.confidence).map(([key, value]) => (
                              <div key={key} className="bg-muted p-2 rounded-md">
                                <div className="text-sm font-medium">{key.replace(/_/g, " ")}</div>
                                <div className="mt-1 h-2 w-full bg-muted-foreground/20 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${typeof value === 'number' && value >= 0.9 ? 'bg-green-500' : 
                                      typeof value === 'number' && value >= 0.7 ? 'bg-primary' : 
                                      typeof value === 'number' && value >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ 
                                      width: `${(typeof value === 'number' ? value : 0) * 100}%` 
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="text-xs">
                                    {key === "overall" && typeof value === 'number' && (
                                      <span className={`${value >= 0.9 ? 'text-green-500' : 
                                        value >= 0.7 ? 'text-primary' : 
                                        value >= 0.5 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {value >= 0.9 ? 'High' : value >= 0.7 ? 'Good' : value >= 0.5 ? 'Medium' : 'Low'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs font-mono">
                                    {typeof value === 'number' ? Math.round(value * 100) : 0}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}
              
              {/* Details tab */}
              {selectedImage.analysisResults && (
                <TabsContent value="details" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-2">Technical Details</h3>
                      <div className="space-y-2">
                        {Object.entries(selectedImage.analysisResults).map(([key, value]) => (
                          <div key={key} className="bg-muted p-3 rounded-md">
                            <div className="font-medium text-sm text-muted-foreground mb-1">
                              {key.replace(/_/g, " ")}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {formatAnalysisResult(key, value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}