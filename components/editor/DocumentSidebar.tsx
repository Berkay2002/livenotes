'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight,
  Star, 
  Download, 
  Share2, 
  Link as LinkIcon, 
  Clock, 
  MoreVertical, 
  FileText, 
  Trash2, 
  History, 
  FileOutput, 
  Settings,
  Users,
  Eye,
  Edit,
  PanelRight,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleDocumentStar, isDocumentStarred } from '@/lib/actions/room.actions';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { Document } from '@/types/document';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface DocumentSidebarProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onToggleComments: () => void;
  isCommentsOpen: boolean;
  currentUserType: 'owner' | 'editor' | 'viewer' | 'creator';
}

export const DocumentSidebar = ({ 
  document, 
  isOpen, 
  onClose,
  onToggleComments,
  isCommentsOpen,
  currentUserType
}: DocumentSidebarProps) => {
  const { user } = useUser();
  const [isStarred, setIsStarred] = useState(false);
  const [isStarLoading, setIsStarLoading] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<{ id: string, date: string }[]>([
    { id: '1', date: new Date().toISOString() } // Current version
  ]);
  const [showDocumentInfo, setShowDocumentInfo] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Determine if user has edit permissions
  const canEdit = currentUserType === 'owner' || currentUserType === 'editor' || currentUserType === 'creator';
  
  // Get the star status on mount
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    
    const checkStarStatus = async () => {
      try {
        const starred = await isDocumentStarred(
          document.id, 
          user.primaryEmailAddress?.emailAddress || ''
        );
        setIsStarred(starred);
      } catch (error) {
        console.error('Error checking star status:', error);
      }
    };

    checkStarStatus();
  }, [document.id, user]);

  // Handle starring/unstarring the document
  const handleToggleStar = async () => {
    if (isStarLoading || !user?.primaryEmailAddress?.emailAddress) return;
    
    setIsStarLoading(true);
    try {
      const result = await toggleDocumentStar(
        document.id, 
        user.primaryEmailAddress?.emailAddress
      );
      
      if (result.success) {
        setIsStarred(result.isStarred || false);
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    } finally {
      setIsStarLoading(false);
    }
  };

  // Handle document download as PDF
  const handleDownload = () => {
    // This is a simplified implementation - in production, you'd want
    // to use a library like jsPDF or call a backend service
    alert('Document download functionality would save the document as PDF');
    // In a real implementation:
    // 1. Capture the content using html2canvas or similar
    // 2. Generate PDF with jsPDF
    // 3. Trigger download
  };

  // Handle document export in various formats
  const handleExport = (format: 'pdf' | 'docx' | 'txt' | 'html') => {
    alert(`Exporting document as ${format.toUpperCase()}`);
    // In a real implementation:
    // 1. Call backend API to convert document
    // 2. Stream the response as a download
    setIsExportMenuOpen(false);
  };

  // Copy shareable document link
  const copyLink = () => {
    const link = `${window.location.origin}/documents/${document.id}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  // Get formatted user role label
  const getUserRoleLabel = () => {
    switch (currentUserType) {
      case 'owner':
      case 'creator': // Treat creator the same as owner
        return {
          label: 'Owner',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
        };
      case 'editor':
        return {
          label: 'Editor',
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-400',
        };
      case 'viewer':
        return {
          label: 'Viewer',
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
        };
      default:
        return {
          label: 'Viewer',
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
        };
    }
  };

  const roleInfo = getUserRoleLabel();

  return (
    <>
      {/* Comments sidebar outside the A4 paper */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity z-40 hidden md:block", // Hidden on mobile with md:block
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Document Sidebar with slide animation */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full bg-dark-200 shadow-xl z-50 w-[320px] transition-transform duration-300 ease-in-out transform border-l border-dark-400 hidden md:flex md:flex-col", // Hidden on mobile with hidden md:flex
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar header with document title */}
          <div className="py-5 px-6 border-b border-dark-400 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white truncate max-w-[200px]">
              {document.metadata?.title || 'Untitled Document'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-dark-300 text-gray-400 hover:text-white transition-colors"
              aria-label="Close document sidebar"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Document Actions */}
          <div className="flex-1 py-4 px-5 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Primary Actions */}
            <div className="grid grid-cols-3 gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="secondary" 
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 h-auto py-3 bg-dark-300 hover:bg-dark-400 border border-dark-400",
                        isStarred && "text-yellow-400"
                      )}
                      onClick={handleToggleStar}
                      disabled={isStarLoading}
                    >
                      <Star className={isStarred ? "fill-yellow-400" : ""} size={18} />
                      <span className="text-xs font-medium">
                        {isStarred ? "Starred" : "Star"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isStarred ? "Remove from starred" : "Add to starred"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu open={isExportMenuOpen} onOpenChange={setIsExportMenuOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          className="flex flex-col items-center justify-center gap-1 h-auto py-3 bg-dark-300 hover:bg-dark-400 border border-dark-400"
                        >
                          <Download size={18} />
                          <span className="text-xs font-medium">Export</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 bg-dark-300 border border-dark-400 text-white">
                        <DropdownMenuItem 
                          className="flex items-center hover:bg-dark-400 cursor-pointer"
                          onClick={() => handleExport('pdf')}
                        >
                          <FileOutput className="mr-2 h-4 w-4" />
                          <span>Export as PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center hover:bg-dark-400 cursor-pointer"
                          onClick={() => handleExport('docx')}
                        >
                          <FileOutput className="mr-2 h-4 w-4" />
                          <span>Export as DOCX</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center hover:bg-dark-400 cursor-pointer"
                          onClick={() => handleExport('txt')}
                        >
                          <FileOutput className="mr-2 h-4 w-4" />
                          <span>Export as TXT</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center hover:bg-dark-400 cursor-pointer"
                          onClick={() => handleExport('html')}
                        >
                          <FileOutput className="mr-2 h-4 w-4" />
                          <span>Export as HTML</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export document</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu open={showShareOptions} onOpenChange={setShowShareOptions}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          className="flex flex-col items-center justify-center gap-1 h-auto py-3 bg-dark-300 hover:bg-dark-400 border border-dark-400"
                        >
                          <Share2 size={18} />
                          <span className="text-xs font-medium">Share</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-dark-300 border border-dark-400 text-white">
                        <DropdownMenuItem 
                          className="flex items-center hover:bg-dark-400 cursor-pointer"
                          onClick={copyLink}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          <span>Copy link</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-dark-400" />
                        <DropdownMenuItem 
                          className="flex items-center hover:bg-dark-400 cursor-pointer"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          <span>Manage access</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share document</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Horizontal line */}
            <Separator className="bg-dark-400" />

            {/* Secondary Actions */}
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Document</h3>
              
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 rounded-md hover:bg-dark-300 text-left"
                onClick={onToggleComments}
              >
                <PanelRight className="h-5 w-5" />
                <span className="font-medium">
                  {isCommentsOpen ? "Hide comments" : "Show comments"}
                </span>
              </button>

              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 rounded-md hover:bg-dark-300 text-left"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                <History className="h-5 w-5" />
                <span className="font-medium">Version history</span>
              </button>

              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 rounded-md hover:bg-dark-300 text-left"
                onClick={() => setShowDocumentInfo(!showDocumentInfo)}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">Document info</span>
              </button>

              {currentUserType === 'owner' && (
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 rounded-md hover:bg-dark-300 text-left"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Document settings</span>
                </button>
              )}
            </div>

            {/* Version History Panel (conditionally rendered) */}
            {showVersionHistory && (
              <div className="mt-4 border border-dark-400 rounded-lg overflow-hidden">
                <div className="bg-dark-300 px-4 py-2 text-sm font-medium text-white flex items-center justify-between">
                  <span>Version History</span>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={() => setShowVersionHistory(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-3 bg-dark-250">
                  <div className="space-y-2">
                    {versions.map((version, index) => (
                      <div 
                        key={version.id} 
                        className={cn(
                          "px-3 py-2 rounded flex items-center justify-between",
                          index === 0 ? "bg-accent-primary/10 text-accent-primary" : "hover:bg-dark-300"  
                        )}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {index === 0 ? 'Current version' : `Version ${versions.length - index}`}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(version.date).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {index === 0 ? (
                            <span className="text-xs bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded">Current</span>
                          ) : (
                            <>
                              <button className="p-1 text-gray-400 hover:text-white rounded">
                                <Eye size={14} />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-white rounded">
                                <Save size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Document Info Panel (conditionally rendered) */}
            {showDocumentInfo && (
              <div className="mt-4 border border-dark-400 rounded-lg overflow-hidden">
                <div className="bg-dark-300 px-4 py-2 text-sm font-medium text-white flex items-center justify-between">
                  <span>Document Information</span>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={() => setShowDocumentInfo(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4 bg-dark-250 space-y-3">
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Title</h4>
                    <p className="text-sm text-white">{document.metadata?.title || 'Untitled Document'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Created by</h4>
                    <p className="text-sm text-white">{document.metadata?.email || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Created on</h4>
                    <p className="text-sm text-white">{new Date(document.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Last modified</h4>
                    <p className="text-sm text-white">{new Date(document.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Your access</h4>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        roleInfo.bgColor,
                        roleInfo.textColor
                      )}>
                        {roleInfo.label}
                      </span>
                      {canEdit ? (
                        <span className="text-xs text-gray-400">Can edit this document</span>
                      ) : (
                        <span className="text-xs text-gray-400">Can view this document</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Horizontal line */}
            <Separator className="bg-dark-400" />

            {/* Actions based on user role */}
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Actions</h3>
              
              {canEdit && (
                <Link
                  href={`/documents/${document.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 rounded-md hover:bg-dark-300"
                >
                  <Edit className="h-5 w-5" />
                  <span className="font-medium">Edit document</span>
                </Link>
              )}
              
              <Link
                href="/"
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 rounded-md hover:bg-dark-300"
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">All documents</span>
              </Link>
              
              {currentUserType === 'owner' && (
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 rounded-md bg-red-900/10 hover:bg-red-900/20 text-left"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="font-medium">Delete document</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 