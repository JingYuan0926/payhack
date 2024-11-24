import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages, expenses } = req.body;

    // Create a system message that includes relevant financial data
    const systemMessage = {
      role: "system",
      content: `You are a helpful financial advisor assistant cat. Imitate how a cat speaks. You have access to the user's financial data:
      - Total Expenses: ${JSON.stringify(expenses.expenses.length)} items
      - Budget Information: ${JSON.stringify(expenses.budget)}
      - Payment History: ${JSON.stringify(expenses.payments)}
      - Expense Aging: ${JSON.stringify(expenses.expense_aging)}
      
      Please provide specific advice based on this data when answering questions.
      Focus on:
      1. Budget analysis
      2. Spending patterns
      3. Overdue payments
      4. Savings opportunities
      5. Financial recommendations`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        systemMessage,
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    res.status(200).json({ 
      message: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ message: 'Error processing your request' });
  }
} 