'use client';

import * as React from 'react';
import { MoreVertical, Pencil, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileActionMenuProps {
  documentId: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function MobileActionMenu({ documentId, onEditClick, onDeleteClick }: MobileActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-md border border-dark-400 bg-dark-300 text-gray-400 hover:bg-dark-400 hover:text-white">
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-dark-200 border-dark-400">
        <Link href={`/documents/${documentId}`} legacyBehavior passHref>
          <DropdownMenuItem className="hover:bg-dark-300 cursor-pointer text-white focus:bg-dark-300 py-2.5">
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Open Document</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={onEditClick} className="hover:bg-dark-300 cursor-pointer text-white focus:bg-dark-300 py-2.5">
          <Pencil className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDeleteClick} className="hover:bg-dark-300 cursor-pointer text-red-400 focus:bg-dark-300 py-2.5">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 