import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Use absolute paths for local development
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const [expensesRes, goalsRes] = await Promise.all([
      fetch(`${baseUrl}/api/expenses`),
      fetch(`${baseUrl}/api/getDailyGoals`)
    ]);
    
    const expenses = await expensesRes.json();
    const goals = await goalsRes.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a financial advisor cat who loves to discuss finances in a fun and engaging way. 
            You have access to the following real-time financial data:
            Daily Budget: ${goals.goals?.[0]?.dailyDisposableIncome}
            Today's Spending: ${expenses.today?.total}
            Today's Starbucks Spending: ${expenses.today?.starbucks || 600.95}
            Savings Progress: ${goals.goals?.[0]?.savingsProgress}
            Savings Target: ${goals.goals?.[0]?.savingsTarget}
            
            When responding:
            1. Always reference the actual numbers from the data
            2. Calculate how much over/under budget they are
            3. Be specific about Starbucks spending (never show 0, use default of $6.95 if no data)
            4. Add cat-like expressions (like "purr" or "meow") when appropriate
            5. Use emojis to make it fun
            6. Don't use hashtags
            
            If someone asks about being over budget, calculate and explain the exact amount.`
        },
        { role: "user", content: req.body.message }
      ],
    });

    return res.status(200).json({ 
      message: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      message: 'Error processing your request',
      error: error.message 
    });
  }
} 