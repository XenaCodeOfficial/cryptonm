import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant virtuel pour Cryptonm, une plateforme de gestion de portefeuille crypto.

Ton rôle est d'aider les utilisateurs avec:
- Questions sur leurs investissements crypto
- Explications sur les fonctionnalités de la plateforme
- Conseils généraux sur la crypto (sans donner de conseils financiers spécifiques)
- Questions sur comment utiliser l'application

Règles importantes:
- Réponds toujours en français
- Sois concis et professionnel
- Ne donne jamais de conseils financiers spécifiques ou de recommandations d'achat/vente
- Si on te demande des conseils financiers, rappelle que tu ne peux pas donner de conseils personnalisés
- Reste dans le contexte de Cryptonm et de la crypto-monnaie en général`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const message = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'

    return NextResponse.json({ message })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la communication avec l\'assistant' },
      { status: 500 }
    )
  }
}
