import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = req.headers;
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const body = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
        create: {
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
      });
      const action = eventType === 'user.created' ? 'created' : 'updated';
      return new Response(`User ${action} successfully`, {
        status: action === 'created' ? 201 : 200,
      });
    } catch (error) {
      const action = eventType === 'user.created' ? 'creation' : 'update';
      console.error(`Error during user ${action}:`, error);
      return new Response(`Error occured during user ${action}`, {
        status: 500,
      });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    if (!id) {
      return new Response('Error: Missing user ID for deletion', { status: 400 });
    }
    try {
      await prisma.user.delete({
        where: {
          clerkId: id,
        },
      });
      return new Response('User deleted successfully', { status: 200 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Record to delete does not exist.
        if (error.code === 'P2025') {
          console.log('User to delete not found. Already deleted?');
          return new Response('User not found', { status: 404 });
        }
      }
      console.error('Error deleting user:', error);
      return new Response('Error occured during user deletion', {
        status: 500,
      });
    }
  }

  // For other events, just log them
  const id = 'id' in evt.data ? evt.data.id : undefined;
  console.log(`Webhook with an ID of ${id || 'unknown'} and type of ${eventType}`);
  console.log('Webhook body:', body);

  return new Response('', { status: 200 });
}
