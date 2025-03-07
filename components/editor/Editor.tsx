'use client';

import Theme from './plugins/Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import React, { useState, Dispatch, SetStateAction } from 'react';

import { FloatingComposer, FloatingThreads, liveblocksConfig, LiveblocksPlugin, useEditorStatus } from '@liveblocks/react-lexical'
import Loader from '../Loader';

import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin'
import { useThreads } from '@liveblocks/react/suspense';
import Comments from '../Comments';
import { DeleteModal } from '../DeleteModal';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

export function Editor({ 
  roomId, 
  currentUserType,
  isCommentOpen,
  setIsCommentOpen
}: { 
  roomId: string, 
  currentUserType: UserType,
  isCommentOpen: boolean,
  setIsCommentOpen: Dispatch<SetStateAction<boolean>>
}) {
  const status = useEditorStatus();
  const { threads } = useThreads();
  
  const initialConfig = liveblocksConfig({
    namespace: 'Editor',
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === 'editor',
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        {/* Responsive Toolbar - Hide on mobile */}
        <div className="toolbar-wrapper hidden md:flex min-w-full justify-between">
          <ToolbarPlugin />
          {currentUserType === 'editor' && <DeleteModal roomId={roomId} />}
        </div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {status === 'not-loaded' || status === 'loading' ? <Loader /> : (
            <div className="editor-inner min-h-screen md:min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10 px-4 md:px-0">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input h-full" />
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              {currentUserType === 'editor' && <FloatingToolbarPlugin />}
              <HistoryPlugin />
              <AutoFocusPlugin />
            </div>
          )}

          {/* Comments System - Available on both desktop and mobile */}
          <LiveblocksPlugin>
            <FloatingComposer className="w-[350px]" />
            <FloatingThreads threads={threads} />
            <Comments 
              isMobileOpen={isCommentOpen}
              onMobileClose={() => setIsCommentOpen(false)}
            />
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}