import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return res.status(200).json({ 
    message: "Meow! 😺 Great question about your cards! Your Maybank card offers better cashback rates - you'll get 5% cashback on weekend dining compared to just 2% with your RHB card. Plus, Maybank gives you 1% on all other spending while RHB only gives 0.5%! Purrfect choice to use your Maybank card more! 🌟 Keep making smart financial decisions! 💳✨"
  });
}
