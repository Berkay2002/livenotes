'use client';

import { dateConverter } from '@/lib/utils';
import { DocumentData } from '@/types/document';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DeleteModal } from './DeleteModal';

interface DocumentCardProps {
  document: DocumentData;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const { id, metadata, createdAt } = document;

  return (
    <div className="group relative rounded-lg bg-dark-200 p-5 shadow-md transition-all hover:bg-dark-300 hover:shadow-xl">
      <div className="mb-4 flex h-36 items-center justify-center rounded bg-dark-100/70">
        <Image 
          src="/assets/icons/doc.svg"
          alt="file"
          width={40}
          height={40}
          className="opacity-70"
        />
      </div>

      <Link href={`/documents/${id}`} className="block">
        <h3 className="mb-1 line-clamp-1 text-lg font-medium text-white group-hover:text-accent-primary">
          {metadata.title}
        </h3>
        <p className="mb-3 text-sm font-light text-gray-400">
          Edited {dateConverter(createdAt)}
        </p>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          <div className="size-6 rounded-full bg-accent-primary ring-2 ring-dark-200" />
          <div className="size-6 rounded-full bg-dark-500 ring-2 ring-dark-200" />
        </div>
        
        <div className="flex items-center">
          <button className="rounded-full p-1.5 text-gray-400 hover:bg-dark-400 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <DeleteModal roomId={id} />
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;