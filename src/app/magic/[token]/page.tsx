import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { signIn } from 'next-auth/react'
import MagicLinkClient from '@/components/auth/MagicLinkClient'

export default async function MagicLinkPage({
  params,
}: {
  params: { token: string }
}) {
  const client = await prisma.client.findUnique({
    where: { magicLink: params.token },
  })

  if (!client) {
    redirect('/login?error=invalid_magic_link')
  }

  // Check if magic link has expired (48 hours)
  if (client.magicLinkExpiresAt && new Date() > client.magicLinkExpiresAt) {
    redirect('/login?error=magic_link_expired')
  }

  // If client already has a password, magic link shouldn't be used again
  if (client.password) {
    redirect('/login?error=magic_link_already_used')
  }

  return <MagicLinkClient client={client} />
}
