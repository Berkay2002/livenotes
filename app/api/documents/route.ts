import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, createDocument } from '@/lib/actions/room.actions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      console.error('API: Email parameter is missing');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`API: Fetching documents for email: ${email}`);

    // Reuse the existing getDocuments function
    const documents = await getDocuments(email);
    
    if (!documents || !documents.data) {
      console.warn('API: No documents data returned from getDocuments');
      return NextResponse.json({
        status: 'success',
        data: []
      });
    }

    console.log(`API: Found ${documents.data.length} documents`);

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
    console.error('API: Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    if (!userId || !email) {
      console.error('API: Missing required fields for document creation', { userId: !!userId, email: !!email });
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    console.log(`API: Creating document for user: ${userId}, email: ${email}`);

    // Create a new document using the existing createDocument function
    const newDocument = await createDocument({
      userId,
      email
    });

    if (!newDocument) {
      console.error('API: Document creation failed - no document returned');
      throw new Error('Failed to create document');
    }

    console.log(`API: Document created with ID: ${newDocument.id}`);

    return NextResponse.json({
      status: 'success',
      id: newDocument.id,
      metadata: newDocument.metadata,
      usersAccesses: newDocument.usersAccesses,
      createdAt: newDocument.createdAt
    });
  } catch (error) {
    console.error('API: Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document', details: String(error) },
      { status: 500 }
    );
  }
} 