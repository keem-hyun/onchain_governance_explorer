import { Suspense } from 'react'
import { notFound } from "next/navigation"
import { fetchGithubProposals } from "@/util/useGithub"
import { Markdown } from "@/components/markdown"
import { Card, CardContent } from "@/components/ui/card"
import { ProposalDetailSkeleton } from '@/components/skeletons/proposal-skeleton'

interface ProposalDetailProps {
  params: Promise<{
    id: string
  }>
}

async function ProposalDetail({ id }: { id: string }) {
  const proposals = await fetchGithubProposals()
  const proposal = proposals.find(p => p.name.startsWith(`${id}-`))

  if (!proposal) {
    notFound()
  }

  const match = proposal.name.match(/^(\d+)-(.+)\.md$/)
  const number = match?.[1] || ''
  const title = match?.[2]?.replace(/-/g, ' ') || proposal.name

  const sanitizedContent = proposal.content
    .replace(/@/g, '&#64;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return (
    <div className="container py-8">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-8">
            SIMD-{number}: {title}
          </h1>
          
          <div className="prose prose-lg dark:prose-invert">
            <Markdown>{sanitizedContent}</Markdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function ProposalPage({ params }: ProposalDetailProps) {
  const resolvedParams = await params
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <Suspense fallback={<ProposalDetailSkeleton />}>
        <ProposalDetail id={resolvedParams.id} />
      </Suspense>
    </div>
  )
}

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  const proposals = await fetchGithubProposals()
  return proposals.map((proposal) => ({
    id: proposal.name.match(/^(\d+)-/)?.[1] || ''
  }))
} 