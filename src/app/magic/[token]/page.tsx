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

  return <MagicLinkClient client={client} />
}
