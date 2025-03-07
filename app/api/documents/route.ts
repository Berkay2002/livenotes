import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, createDocument } from '@/lib/actions/room.actions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Reuse the existing getDocuments function
    const documents = await getDocuments(email);

    // Format the response to match what DocumentsList expects
    return NextResponse.json({
      status: 'success',
      data: documents.data?.map((doc: any) => ({
        id: doc.id,
        metadata: {
          title: doc.metadata.title,
          creatorId: doc.metadata.creatorId || '',
          email: doc.metadata.email || email
        },
        usersAccesses: doc.usersAccesses || { [email]: ['read', 'write'] },
        createdAt: doc.createdAt
      })) || []
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    // Create a new document using the existing createDocument function
    const newDocument = await createDocument({
      userId,
      email
    });

    if (!newDocument) {
      throw new Error('Failed to create document');
    }

    return NextResponse.json({
      status: 'success',
      id: newDocument.id,
      metadata: newDocument.metadata,
      usersAccesses: newDocument.usersAccesses,
      createdAt: newDocument.createdAt
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
} 